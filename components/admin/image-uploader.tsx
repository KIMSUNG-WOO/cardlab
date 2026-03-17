'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (url: string) => void
  cardSlug: string
}

export function ImageUploader({ value, onChange, cardSlug }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  // 파일 선택
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('10MB 이하 이미지만 가능합니다.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      setCropFile(file)
      setShowCrop(true)
    }
    reader.readAsDataURL(file)
  }

  // 그대로 업로드 (크롭 없이)
  async function uploadDirect() {
    if (!cropFile) return
    setUploading(true)
    setError('')
    try {
      const ext = cropFile.name.split('.').pop() ?? 'jpg'
      const path = `profiles/${cardSlug}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('card-images')
        .upload(path, cropFile, { upsert: true, contentType: cropFile.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('card-images').getPublicUrl(path)
      onChange(data.publicUrl)
      setShowCrop(false)
      setPreview(null)
    } catch (e: any) {
      setError('업로드 실패: ' + (e?.message ?? '알 수 없는 오류'))
    } finally {
      setUploading(false)
    }
  }

  // 캔버스로 크롭 후 업로드
  async function uploadCropped(aspectRatio: number) {
    if (!imgRef.current || !canvasRef.current || !cropFile) return
    setUploading(true)
    setError('')
    try {
      const img = imgRef.current
      const canvas = canvasRef.current
      const srcW = img.naturalWidth
      const srcH = img.naturalHeight

      let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH
      if (srcW / srcH > aspectRatio) {
        cropW = Math.round(srcH * aspectRatio)
        cropX = Math.round((srcW - cropW) / 2)
      } else {
        cropH = Math.round(srcW / aspectRatio)
        cropY = Math.round((srcH - cropH) / 2)
      }

      canvas.width = cropW
      canvas.height = cropH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92))
      const path = `profiles/${cardSlug}-${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage
        .from('card-images')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('card-images').getPublicUrl(path)
      onChange(data.publicUrl)
      setShowCrop(false)
      setPreview(null)
    } catch (e: any) {
      setError('업로드 실패: ' + (e?.message ?? '알 수 없는 오류'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {/* 현재 이미지 미리보기 */}
      {value && !showCrop && (
        <div style={{ marginBottom: 12, position: 'relative', width: 120, height: 160, borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2d42' }}>
          <img src={value} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>
      )}

      {/* 파일 선택 버튼 */}
      {!showCrop && (
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '10px 16px', background: '#0d1520', border: '1px dashed #1e2d42', borderRadius: 12, color: '#64748b', fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'center' }}
          >
            {value ? '📷 이미지 변경' : '📷 이미지 업로드'}
          </button>
          <p style={{ fontSize: 11, color: '#374151', marginTop: 6 }}>또는 URL을 직접 입력해도 됩니다 (최대 10MB)</p>
        </div>
      )}

      {/* 크롭 영역 */}
      {showCrop && preview && (
        <div style={{ background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>📐 어떻게 자를까요?</p>

          {/* 숨겨진 캔버스 */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* 이미지 미리보기 */}
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 300 }}>
            <img
              ref={imgRef}
              src={preview}
              alt="크롭 미리보기"
              style={{ width: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* 크롭 옵션 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { label: '세로형\n3:4', ratio: 3/4 },
              { label: '정사각\n1:1', ratio: 1 },
              { label: '가로형\n4:3', ratio: 4/3 },
            ].map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => uploadCropped(opt.ratio)}
                disabled={uploading}
                style={{ padding: '10px 8px', background: '#111827', border: '1px solid #1e2d42', borderRadius: 10, color: '#94a3b8', fontSize: 12, cursor: 'pointer', whiteSpace: 'pre-line', lineHeight: 1.4 }}
              >
                {uploading ? '⏳' : opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={uploadDirect}
              disabled={uploading}
              style={{ padding: '10px', background: '#1e3a5f', border: 'none', borderRadius: 10, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
            >
              {uploading ? '업로드 중...' : '그대로 업로드'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCrop(false); setPreview(null); setCropFile(null) }}
              style={{ padding: '10px', background: '#111827', border: '1px solid #1e2d42', borderRadius: 10, color: '#64748b', fontSize: 12, cursor: 'pointer' }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
