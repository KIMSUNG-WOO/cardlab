'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateId } from '@/lib/utils'
import { ImageUploader } from './image-uploader'

interface Company {
  id: string
  name: string
  logo_url: string | null
  background_url: string | null
  created_at: string
}

export function CompanyManager({ companies: init }: { companies: Company[] }) {
  const supabase = createClient()
  const [companies, setCompanies] = useState(init)
  const [newName, setNewName]         = useState('')
  const [newLogo, setNewLogo]         = useState('')
  const [newBackground, setNewBackground] = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [editId, setEditId]           = useState<string | null>(null)
  const [editName, setEditName]       = useState('')
  const [editLogo, setEditLogo]       = useState('')
  const [editBg, setEditBg]           = useState('')
  const [editSaving, setEditSaving]   = useState(false)

  const tempSlug = `company-${generateId()}`

  // ── 추가 ──────────────────────────────────────────────
  async function addCompany() {
    if (!newName.trim()) return setError('회사명을 입력해주세요.')
    setSaving(true); setError('')
    try {
      const { data, error: e } = await supabase
        .from('companies')
        .insert({
          name:           newName.trim(),
          logo_url:       newLogo       || null,
          background_url: newBackground || null,
        })
        .select('*')
        .single()
      if (e) throw e
      setCompanies(p => [data, ...p])
      setNewName(''); setNewLogo(''); setNewBackground('')
    } catch (e: any) {
      setError(e?.message ?? '저장 실패')
    } finally { setSaving(false) }
  }

  // ── 수정 ──────────────────────────────────────────────
  function startEdit(c: Company) {
    setEditId(c.id)
    setEditName(c.name)
    setEditLogo(c.logo_url ?? '')
    setEditBg(c.background_url ?? '')
  }

  async function saveEdit() {
    if (!editId) return
    setEditSaving(true)
    try {
      const { error: e } = await supabase
        .from('companies')
        .update({ name: editName.trim(), logo_url: editLogo || null, background_url: editBg || null })
        .eq('id', editId)
      if (e) throw e
      setCompanies(p => p.map(c =>
        c.id === editId
          ? { ...c, name: editName.trim(), logo_url: editLogo || null, background_url: editBg || null }
          : c
      ))
      setEditId(null)
    } catch (e: any) { alert(e?.message ?? '수정 실패') }
    finally { setEditSaving(false) }
  }

  // ── 삭제 ──────────────────────────────────────────────
  async function deleteCompany(id: string) {
    if (!confirm('이 회사를 삭제하시겠습니까?')) return
    await supabase.from('companies').delete().eq('id', id)
    setCompanies(p => p.filter(c => c.id !== id))
  }

  const I: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#fff',
    border: '1.5px solid #dee2e6', borderRadius: 8,
    color: '#212529', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  }
  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>{children}</label>
  )

  return (
    <div>
      {/* ── 새 회사 등록 ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#212529', marginBottom: 16 }}>새 회사 등록</p>
        <p style={{ fontSize: 12, color: '#868e96', marginBottom: 16 }}>
          회사명 · 로고 · 배경을 등록해두면 명함 생성 시 자동으로 세팅됩니다.
        </p>

        <div style={{ marginBottom: 14 }}>
          <Lbl>회사명 *</Lbl>
          <input style={I} value={newName} onChange={e => setNewName(e.target.value)} placeholder="(주)어센틱금융그룹" />
        </div>

        <div style={{ marginBottom: 14 }}>
          <Lbl>회사 로고 업로드</Lbl>
          <ImageUploader value={newLogo} onChange={setNewLogo} cardSlug={tempSlug} bucket="card-images" folder="logos" />
          {!newLogo && (
            <div style={{ marginTop: 8 }}>
              <Lbl>또는 로고 URL 직접 입력</Lbl>
              <input style={I} value={newLogo} onChange={e => setNewLogo(e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <Lbl>회사 배경 이미지 업로드</Lbl>
          <p style={{ fontSize: 11, color: '#adb5bd', marginBottom: 8 }}>
            명함 상단 히어로 영역에 표시되는 배경 이미지입니다.
          </p>
          <ImageUploader value={newBackground} onChange={setNewBackground} cardSlug={`${tempSlug}-bg`} bucket="card-images" folder="backgrounds" />
          {!newBackground && (
            <div style={{ marginTop: 8 }}>
              <Lbl>또는 배경 이미지 URL 직접 입력</Lbl>
              <input style={I} value={newBackground} onChange={e => setNewBackground(e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>

        {/* 미리보기 */}
        {(newName || newLogo || newBackground) && (
          <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', border: '1px solid #e9ecef' }}>
            {newBackground && (
              <div style={{ height: 80, backgroundImage: `url(${newBackground})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8f9fa' }}>
              {newLogo
                ? <img src={newLogo} alt="로고" style={{ height: 34, objectFit: 'contain' }} />
                : <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
              }
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#212529', margin: 0 }}>{newName || '회사명'}</p>
                <p style={{ fontSize: 11, color: '#adb5bd' }}>미리보기</p>
              </div>
            </div>
          </div>
        )}

        {error && <div style={{ padding: '8px 12px', background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 8, color: '#c92a2a', fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button onClick={addCompany} disabled={saving} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#4263eb,#3b5bdb)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? '저장 중...' : '회사 등록'}
        </button>
      </div>

      {/* ── 등록된 회사 목록 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {companies.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', border: '2px dashed #dee2e6', borderRadius: 14, color: '#adb5bd', fontSize: 14 }}>
            등록된 회사가 없습니다
          </div>
        )}

        {companies.map(company => (
          <div key={company.id} style={{ background: '#fff', border: '1.5px solid #e9ecef', borderRadius: 14, overflow: 'hidden' }}>
            {/* 배경 미리보기 */}
            {company.background_url && (
              <div style={{ height: 70, backgroundImage: `url(${company.background_url})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }} />
            )}

            <div style={{ padding: 16 }}>
              {editId === company.id ? (
                /* 수정 모드 */
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <Lbl>회사명</Lbl>
                    <input style={I} value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <Lbl>로고 URL</Lbl>
                    <input style={I} value={editLogo} onChange={e => setEditLogo(e.target.value)} placeholder="https://..." />
                    <ImageUploader value={editLogo} onChange={setEditLogo} cardSlug={`${company.id}-logo`} bucket="card-images" folder="logos" />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Lbl>배경 이미지 URL</Lbl>
                    <input style={I} value={editBg} onChange={e => setEditBg(e.target.value)} placeholder="https://..." />
                    <ImageUploader value={editBg} onChange={setEditBg} cardSlug={`${company.id}-bg`} bucket="card-images" folder="backgrounds" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={saveEdit} disabled={editSaving} style={{ flex: 1, padding: '10px', background: '#4263eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {editSaving ? '저장 중...' : '저장'}
                    </button>
                    <button onClick={() => setEditId(null)} style={{ padding: '10px 16px', background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 보기 모드 */
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {company.logo_url
                    ? <img src={company.logo_url} alt={company.name} style={{ height: 38, objectFit: 'contain', flexShrink: 0 }} />
                    : <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#212529', margin: 0 }}>{company.name}</p>
                    <p style={{ fontSize: 11, color: '#adb5bd', marginTop: 2 }}>
                      {company.logo_url ? '로고 ✓' : '로고 없음'} · {company.background_url ? '배경 ✓' : '배경 없음'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(company)} style={{ padding: '6px 12px', background: '#e7f0ff', border: '1px solid #bac8ff', borderRadius: 8, color: '#4263eb', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>수정</button>
                    <button onClick={() => deleteCompany(company.id)} style={{ padding: '6px 12px', background: '#fff3f3', border: '1px solid #ffc9c9', borderRadius: 8, color: '#c92a2a', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
