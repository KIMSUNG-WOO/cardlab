'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (url: string) => void
  cardSlug: string
}

// 크롭 좌표 (이미지 컨테이너 기준 %)
interface Crop { x: number; y: number; w: number; h: number }

type DragType = 'move' | 'tl' | 'tr' | 'bl' | 'br' | null

export function ImageUploader({ value, onChange, cardSlug }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hiddenCanvas = useRef<HTMLCanvasElement>(null)
  const previewCanvas = useRef<HTMLCanvasElement>(null)
  const naturalImg = useRef<HTMLImageElement | null>(null)

  const [uploading, setUploading] = useState(false)
  const [rawPreview, setRawPreview] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [imgReady, setImgReady] = useState(false)
  const [error, setError] = useState('')

  const [crop, setCrop] = useState<Crop>({ x:10, y:5, w:80, h:90 })
  const dragRef = useRef<{ type: DragType; startX: number; startY: number; startCrop: Crop } | null>(null)

  // 이미지 로드 → 미리보기 그리기
  useEffect(() => {
    if (!rawPreview || !showCrop) return
    const img = new window.Image()
    img.onload = () => {
      naturalImg.current = img
      setImgReady(true)
    }
    img.src = rawPreview
  }, [rawPreview, showCrop])

  // crop 바뀔 때마다 캔버스 리렌더
  useEffect(() => {
    if (imgReady && naturalImg.current) drawCanvas(naturalImg.current)
  }, [crop, imgReady])

  function drawCanvas(img: HTMLImageElement) {
    const canvas = previewCanvas.current
    if (!canvas) return
    const CW = canvas.offsetWidth || 380
    const CH = Math.round(CW * 1.1)
    canvas.width = CW; canvas.height = CH

    const ctx = canvas.getContext('2d')!
    const scale = Math.min(CW / img.naturalWidth, CH / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    const dx = (CW - dw) / 2
    const dy = (CH - dh) / 2

    // 전체 이미지
    ctx.drawImage(img, dx, dy, dw, dh)

    // 어두운 오버레이
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, CW, CH)

    // 크롭 영역 밝게
    const cx = (crop.x/100)*CW, cy = (crop.y/100)*CH
    const cw2 = (crop.w/100)*CW, ch2 = (crop.h/100)*CH
    ctx.save()
    ctx.beginPath(); ctx.rect(cx, cy, cw2, ch2); ctx.clip()
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.restore()

    // 크롭 테두리
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([5,3])
    ctx.strokeRect(cx, cy, cw2, ch2); ctx.setLineDash([])

    // 3분할 가이드
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1
    for (let i=1;i<3;i++) {
      ctx.beginPath(); ctx.moveTo(cx+(cw2*i/3),cy); ctx.lineTo(cx+(cw2*i/3),cy+ch2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx,cy+(ch2*i/3)); ctx.lineTo(cx+cw2,cy+(ch2*i/3)); ctx.stroke()
    }

    // 핸들
    const handles = [{x:cx,y:cy},{x:cx+cw2,y:cy},{x:cx,y:cy+ch2},{x:cx+cw2,y:cy+ch2}]
    handles.forEach(h => {
      ctx.fillStyle = '#fff'; ctx.fillRect(h.x-6,h.y-6,12,12)
    })
  }

  function getPct(e: React.MouseEvent) {
    const canvas = previewCanvas.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    const pos = getPct(e)
    const { x:cx, y:cy, w:cw2, h:ch2 } = crop
    const H = 5 // handle hit area %

    type Corner = { name: Exclude<DragType, 'move'|null>; x:number; y:number }
    const corners: Corner[] = [
      { name:'tl', x:cx,      y:cy       },
      { name:'tr', x:cx+cw2,  y:cy       },
      { name:'bl', x:cx,      y:cy+ch2   },
      { name:'br', x:cx+cw2,  y:cy+ch2   },
    ]
    for (const c of corners) {
      if (Math.abs(pos.x-c.x)<H && Math.abs(pos.y-c.y)<H) {
        dragRef.current = { type:c.name, startX:pos.x, startY:pos.y, startCrop:{...crop} }
        return
      }
    }
    if (pos.x>cx && pos.x<cx+cw2 && pos.y>cy && pos.y<cy+ch2) {
      dragRef.current = { type:'move', startX:pos.x, startY:pos.y, startCrop:{...crop} }
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    const pos = getPct(e)
    const dx = pos.x - dragRef.current.startX
    const dy = pos.y - dragRef.current.startY
    const sc = dragRef.current.startCrop
    const MIN = 8
    const clamp = (v:number,mn:number,mx:number) => Math.max(mn,Math.min(mx,v))

    let next = { ...crop }
    if (dragRef.current.type === 'move') {
      next = { ...sc, x:clamp(sc.x+dx,0,100-sc.w), y:clamp(sc.y+dy,0,100-sc.h) }
    } else if (dragRef.current.type === 'br') {
      next = { x:sc.x, y:sc.y, w:clamp(sc.w+dx,MIN,100-sc.x), h:clamp(sc.h+dy,MIN,100-sc.y) }
    } else if (dragRef.current.type === 'tr') {
      const nh=clamp(sc.h-dy,MIN,sc.y+sc.h); next={x:sc.x,y:sc.y+sc.h-nh,w:clamp(sc.w+dx,MIN,100-sc.x),h:nh}
    } else if (dragRef.current.type === 'bl') {
      const nw=clamp(sc.w-dx,MIN,sc.x+sc.w); next={x:sc.x+sc.w-nw,y:sc.y,w:nw,h:clamp(sc.h+dy,MIN,100-sc.y)}
    } else if (dragRef.current.type === 'tl') {
      const nw=clamp(sc.w-dx,MIN,sc.x+sc.w),nh=clamp(sc.h-dy,MIN,sc.y+sc.h)
      next={x:sc.x+sc.w-nw,y:sc.y+sc.h-nh,w:nw,h:nh}
    }
    setCrop(next)
  }

  function onMouseUp() { dragRef.current = null }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { setError('이미지 파일만 업로드 가능합니다.'); return }
    if (file.size > 10*1024*1024) { setError('10MB 이하 이미지만 가능합니다.'); return }
    setError(''); setImgReady(false)
    const reader = new FileReader()
    reader.onload = ev => {
      setRawPreview(ev.target?.result as string)
      setCropFile(file)
      setCrop({ x:10, y:5, w:80, h:90 })
      setShowCrop(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function doUpload() {
    if (!cropFile || !naturalImg.current) return
    setUploading(true); setError('')

    try {
      // ⭐ RLS 오류 핵심 해결: 세션 확인 후 업로드
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('로그인 세션이 만료되었습니다. 페이지를 새로고침 후 다시 로그인해주세요.')
      }

      const img = naturalImg.current
      const canvas = previewCanvas.current!
      const CW = canvas.width; const CH = canvas.height
      const scale = Math.min(CW/img.naturalWidth, CH/img.naturalHeight)
      const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale
      const dx = (CW-dw)/2, dy = (CH-dh)/2

      // 크롭 픽셀 계산
      const cropXpx = ((crop.x/100)*CW - dx) / scale
      const cropYpx = ((crop.y/100)*CH - dy) / scale
      const cropWpx = (crop.w/100)*CW / scale
      const cropHpx = (crop.h/100)*CH / scale

      const outW = Math.max(1, Math.min(Math.round(cropWpx), img.naturalWidth))
      const outH = Math.max(1, Math.min(Math.round(cropHpx), img.naturalHeight))

      const hc = hiddenCanvas.current!
      hc.width = outW; hc.height = outH
      const hctx = hc.getContext('2d')!
      hctx.drawImage(img, Math.max(0,cropXpx), Math.max(0,cropYpx), outW, outH, 0, 0, outW, outH)

      const blob = await new Promise<Blob>((res, rej) =>
        hc.toBlob(b => b ? res(b) : rej(new Error('이미지 처리 실패')), 'image/jpeg', 0.92)
      )

      const path = `profiles/${cardSlug}-${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage
        .from('card-images')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('card-images').getPublicUrl(path)
      onChange(urlData.publicUrl)
      setShowCrop(false); setRawPreview(null); setImgReady(false)
    } catch (e: any) {
      setError('업로드 실패: ' + (e?.message ?? '알 수 없는 오류'))
    } finally { setUploading(false) }
  }

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div>
      <canvas ref={hiddenCanvas} style={{ display:'none' }} />

      {/* 현재 이미지 미리보기 */}
      {value && !showCrop && (
        <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ position:'relative', width:88, height:116, borderRadius:10, overflow:'hidden', border:'2px solid #dee2e6', flexShrink:0 }}>
            <img src={value} alt="프로필" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:12, color:'#6c757d', margin:0 }}>현재 등록된 프로필 사진</p>
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding:'7px 14px', background:'#4263eb', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:600 }}>
                사진 변경
              </button>
              <button type="button" onClick={() => onChange('')} style={{ padding:'7px 14px', background:'#f1f3f5', color:'#6c757d', border:'1px solid #dee2e6', borderRadius:8, fontSize:12, cursor:'pointer' }}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 업로드 버튼 */}
      {!showCrop && !value && (
        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding:'16px', background:'#f8f9fa', border:'2px dashed #ced4da', borderRadius:12, color:'#868e96', fontSize:13, cursor:'pointer', width:'100%', textAlign:'center', transition:'all 0.2s' }}>
          📷 사진 클릭하여 업로드 (최대 10MB)
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:'none' }} />

      {/* 자유 크롭 편집기 */}
      {showCrop && rawPreview && (
        <div style={{ background:'#fff', border:'1.5px solid #dee2e6', borderRadius:16, padding:18 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#212529', margin:0 }}>📐 노출 영역 조정</p>
            <p style={{ fontSize:11, color:'#adb5bd' }}>밝은 영역이 명함에 표시됩니다</p>
          </div>

          {/* 크롭 캔버스 */}
          <div style={{ position:'relative', width:'100%', marginBottom:14, borderRadius:10, overflow:'hidden', cursor: dragRef.current ? 'grabbing' : 'default', userSelect:'none', background:'#000' }}>
            <canvas
              ref={previewCanvas}
              style={{ display:'block', width:'100%', height:'auto', touchAction:'none' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            {!imgReady && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13 }}>
                이미지 로딩 중...
              </div>
            )}
          </div>

          <p style={{ fontSize:11, color:'#adb5bd', marginBottom:12, textAlign:'center' }}>
            흰 모서리 핸들을 드래그해서 크롭 영역을 조절하세요
          </p>

          <div style={{ display:'flex', gap:8 }}>
            <button type="button" onClick={doUpload} disabled={uploading || !imgReady} style={{ flex:1, padding:'12px', background: uploading ? '#adb5bd' : 'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor: uploading || !imgReady ? 'not-allowed' : 'pointer' }}>
              {uploading ? '⏳ 업로드 중...' : !imgReady ? '이미지 로딩 중...' : '✓ 이 영역으로 저장'}
            </button>
            <button type="button" onClick={() => { setShowCrop(false); setRawPreview(null); setCropFile(null); setImgReady(false) }} style={{ padding:'12px 16px', background:'#f1f3f5', color:'#495057', border:'1px solid #dee2e6', borderRadius:10, fontSize:13, cursor:'pointer' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontSize:12, color:'#c92a2a', marginTop:8, padding:'8px 12px', background:'#fff5f5', border:'1px solid #ffc9c9', borderRadius:8 }}>
          {error}
        </div>
      )}
    </div>
  )
}
