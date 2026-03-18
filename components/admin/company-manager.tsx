'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateId } from '@/lib/utils'
import { ImageUploader } from './image-uploader'

interface Company { id: string; name: string; logo_url: string | null; created_at: string }

export function CompanyManager({ companies: init }: { companies: Company[] }) {
  const supabase = createClient()
  const [companies, setCompanies] = useState(init)
  const [newName, setNewName] = useState('')
  const [newLogo, setNewLogo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function addCompany() {
    if (!newName.trim()) return setError('회사명을 입력해주세요.')
    setSaving(true); setError('')
    try {
      const { data, error: e } = await supabase
        .from('companies')
        .insert({ name: newName.trim(), logo_url: newLogo || null })
        .select('*')
        .single()
      if (e) throw e
      setCompanies(p => [data, ...p])
      setNewName(''); setNewLogo('')
    } catch (e: any) {
      setError(e?.message ?? '저장 실패')
    } finally { setSaving(false) }
  }

  async function deleteCompany(id: string) {
    await supabase.from('companies').delete().eq('id', id)
    setCompanies(p => p.filter(c => c.id !== id))
  }

  const tempSlug = `company-${generateId()}`

  return (
    <div>
      {/* 새 회사 추가 */}
      <div className="admin-card" style={{ marginBottom:20 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'#212529', marginBottom:16 }}>새 회사 등록</p>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>회사명 *</label>
          <input className="admin-input" style={{ width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #dee2e6', borderRadius:8, color:'#212529', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="(주)어센틱금융그룹" />
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>회사 로고 업로드 + 크롭</label>
          <ImageUploader value={newLogo} onChange={setNewLogo} cardSlug={tempSlug} bucket="card-images" folder="logos" />
          {!newLogo && (
            <div style={{ marginTop:8 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>또는 로고 URL 직접 입력</label>
              <input style={{ width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #dee2e6', borderRadius:8, color:'#212529', fontSize:14, outline:'none', boxSizing:'border-box' as const }} value={newLogo} onChange={e=>setNewLogo(e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>

        {/* 미리보기 */}
        {(newName || newLogo) && (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:10, marginBottom:14 }}>
            {newLogo ? (
              <img src={newLogo} alt="로고" style={{ height:36, objectFit:'contain' }} />
            ) : (
              <div style={{ width:36, height:36, borderRadius:8, background:'#e9ecef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏢</div>
            )}
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'#212529', margin:0 }}>{newName || '회사명'}</p>
              <p style={{ fontSize:11, color:'#adb5bd' }}>미리보기</p>
            </div>
          </div>
        )}

        {error && <div style={{ padding:'8px 12px', background:'#fff5f5', border:'1px solid #ffc9c9', borderRadius:8, color:'#c92a2a', fontSize:12, marginBottom:12 }}>{error}</div>}

        <button onClick={addCompany} disabled={saving} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
          {saving ? '저장 중...' : '회사 등록'}
        </button>
      </div>

      {/* 등록된 회사 목록 */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {companies.length === 0 && (
          <div style={{ padding:'40px', textAlign:'center', background:'#fff', border:'2px dashed #dee2e6', borderRadius:14, color:'#adb5bd', fontSize:14 }}>
            등록된 회사가 없습니다
          </div>
        )}
        {companies.map(company => (
          <div key={company.id} style={{ background:'#fff', border:'1.5px solid #e9ecef', borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14 }}>
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} style={{ height:40, objectFit:'contain', flexShrink:0 }} />
            ) : (
              <div style={{ width:44, height:44, borderRadius:10, background:'#f1f3f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏢</div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'#212529', margin:0 }}>{company.name}</p>
              {company.logo_url && <p style={{ fontSize:11, color:'#adb5bd', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{company.logo_url}</p>}
            </div>
            <button onClick={() => deleteCompany(company.id)} style={{ padding:'6px 12px', background:'#fff3f3', border:'1px solid #ffc9c9', borderRadius:8, color:'#c92a2a', cursor:'pointer', fontSize:12, fontWeight:600 }}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  )
}
