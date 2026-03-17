'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (url: string) => void
  cardSlug: string
  bucket?: string
  folder?: string
}

interface Crop { x: number; y: number; w: number; h: number }
type DragType = 'move' | 'tl' | 'tr' | 'bl' | 'br' | null

export function ImageUploader({ value, onChange, cardSlug, bucket = 'card-images', folder = 'profiles' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const hiddenCanvas = useRef<HTMLCanvasElement>(null)
  const previewCanvas = useRef<HTMLCanvasElement>(null)
  const naturalImg = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<{ type: DragType; sx: number; sy: number; sc: Crop } | null>(null)

  const [uploading, setUploading] = useState(false)
  const [rawPreview, setRawPreview] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [showCrop, setShowCrop] = useState(false)
  const [imgReady, setImgReady] = useState(false)
  const [error, setError] = useState('')
  const [crop, setCrop] = useState<Crop>({ x:10, y:5, w:80, h:90 })
  const [canvasSize, setCanvasSize] = useState({ w:380, h:420 })

  useEffect(() => {
    if (!rawPreview || !showCrop) return
    const img = new window.Image()
    img.onload = () => { naturalImg.current = img; setImgReady(true) }
    img.src = rawPreview
  }, [rawPreview, showCrop])

  useEffect(() => {
    if (imgReady && naturalImg.current) draw(naturalImg.current)
  }, [crop, imgReady, canvasSize])

  function draw(img: HTMLImageElement) {
    const cv = previewCanvas.current; if (!cv) return
    const W = canvasSize.w, H = canvasSize.h
    cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')!
    const sc = Math.min(W/img.naturalWidth, H/img.naturalHeight)
    const dw = img.naturalWidth*sc, dh = img.naturalHeight*sc
    const dx = (W-dw)/2, dy = (H-dh)/2
    ctx.drawImage(img, dx, dy, dw, dh)
    // 오버레이
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H)
    // 크롭 영역 밝게
    const cx=(crop.x/100)*W, cy=(crop.y/100)*H, cw=(crop.w/100)*W, ch=(crop.h/100)*H
    ctx.save(); ctx.beginPath(); ctx.rect(cx,cy,cw,ch); ctx.clip()
    ctx.drawImage(img, dx, dy, dw, dh); ctx.restore()
    // 테두리
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.setLineDash([5,3])
    ctx.strokeRect(cx,cy,cw,ch); ctx.setLineDash([])
    // 3분할 가이드
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1
    for(let i=1;i<3;i++){
      ctx.beginPath();ctx.moveTo(cx+(cw*i/3),cy);ctx.lineTo(cx+(cw*i/3),cy+ch);ctx.stroke()
      ctx.beginPath();ctx.moveTo(cx,cy+(ch*i/3));ctx.lineTo(cx+cw,cy+(ch*i/3));ctx.stroke()
    }
    // 핸들
    [[cx,cy],[cx+cw,cy],[cx,cy+ch],[cx+cw,cy+ch]].forEach(([hx,hy])=>{
      ctx.fillStyle='#fff'; ctx.fillRect(hx-6,hy-6,12,12)
    })
  }

  function getPct(e: React.MouseEvent) {
    const cv = previewCanvas.current!; const r = cv.getBoundingClientRect()
    return { x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 }
  }

  function onDown(e: React.MouseEvent) {
    const p = getPct(e); const {x:cx,y:cy,w:cw,h:ch} = crop; const H=5
    const corners: [DragType,number,number][] = [['tl',cx,cy],['tr',cx+cw,cy],['bl',cx,cy+ch],['br',cx+cw,cy+ch]]
    for(const [n,hx,hy] of corners){
      if(Math.abs(p.x-hx)<H&&Math.abs(p.y-hy)<H){ dragRef.current={type:n,sx:p.x,sy:p.y,sc:{...crop}}; return }
    }
    if(p.x>cx&&p.x<cx+cw&&p.y>cy&&p.y<cy+ch) dragRef.current={type:'move',sx:p.x,sy:p.y,sc:{...crop}}
  }

  function onMove(e: React.MouseEvent) {
    if(!dragRef.current) return
    const p=getPct(e); const dx=p.x-dragRef.current.sx; const dy=p.y-dragRef.current.sy
    const sc=dragRef.current.sc; const MIN=8
    const cl=(v:number,mn:number,mx:number)=>Math.max(mn,Math.min(mx,v))
    let next=crop
    if(dragRef.current.type==='move') next={...sc,x:cl(sc.x+dx,0,100-sc.w),y:cl(sc.y+dy,0,100-sc.h)}
    else if(dragRef.current.type==='br') next={x:sc.x,y:sc.y,w:cl(sc.w+dx,MIN,100-sc.x),h:cl(sc.h+dy,MIN,100-sc.y)}
    else if(dragRef.current.type==='tr'){const nh=cl(sc.h-dy,MIN,sc.y+sc.h);next={x:sc.x,y:sc.y+sc.h-nh,w:cl(sc.w+dx,MIN,100-sc.x),h:nh}}
    else if(dragRef.current.type==='bl'){const nw=cl(sc.w-dx,MIN,sc.x+sc.w);next={x:sc.x+sc.w-nw,y:sc.y,w:nw,h:cl(sc.h+dy,MIN,100-sc.y)}}
    else if(dragRef.current.type==='tl'){const nw=cl(sc.w-dx,MIN,sc.x+sc.w),nh=cl(sc.h-dy,MIN,sc.y+sc.h);next={x:sc.x+sc.w-nw,y:sc.y+sc.h-nh,w:nw,h:nh}}
    setCrop(next)
  }

  function onUp() { dragRef.current=null }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f=e.target.files?.[0]; if(!f) return
    if(!f.type.startsWith('image/')){ setError('이미지 파일만 가능합니다.'); return }
    if(f.size>10*1024*1024){ setError('10MB 이하만 가능합니다.'); return }
    setError(''); setImgReady(false)
    const r=new FileReader(); r.onload=ev=>{
      setRawPreview(ev.target?.result as string)
      setCropFile(f); setCrop({x:10,y:5,w:80,h:90}); setShowCrop(true)
    }; r.readAsDataURL(f); e.target.value=''
  }

  async function doUpload() {
    if(!cropFile||!naturalImg.current) return
    setUploading(true); setError('')
    try {
      // ⭐ RLS 오류 핵심 해결: 세션 확인 필수
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('로그인 세션이 만료됐습니다. 새로고침 후 다시 로그인해주세요.')

      const img=naturalImg.current; const cv=previewCanvas.current!
      const W=cv.width,H=cv.height
      const sc=Math.min(W/img.naturalWidth,H/img.naturalHeight)
      const dw=img.naturalWidth*sc,dh=img.naturalHeight*sc
      const dx=(W-dw)/2,dy=(H-dh)/2
      const cropXpx=((crop.x/100)*W-dx)/sc, cropYpx=((crop.y/100)*H-dy)/sc
      const cropWpx=(crop.w/100)*W/sc, cropHpx=(crop.h/100)*H/sc
      const outW=Math.max(1,Math.min(Math.round(cropWpx),img.naturalWidth))
      const outH=Math.max(1,Math.min(Math.round(cropHpx),img.naturalHeight))
      const hc=hiddenCanvas.current!; hc.width=outW; hc.height=outH
      hc.getContext('2d')!.drawImage(img,Math.max(0,cropXpx),Math.max(0,cropYpx),outW,outH,0,0,outW,outH)
      const blob=await new Promise<Blob>((res,rej)=>hc.toBlob(b=>b?res(b):rej(new Error('변환 실패')),'image/jpeg',0.92))
      const path=`${folder}/${cardSlug}-${Date.now()}.jpg`
      const {error:upErr}=await supabase.storage.from(bucket).upload(path,blob,{upsert:true,contentType:'image/jpeg'})
      if(upErr) throw upErr
      const {data:urlData}=supabase.storage.from(bucket).getPublicUrl(path)
      onChange(urlData.publicUrl)
      setShowCrop(false); setRawPreview(null); setImgReady(false)
    } catch(e:any){
      setError('업로드 실패: '+(e?.message??'오류'))
    } finally { setUploading(false) }
  }

  return (
    <div>
      <canvas ref={hiddenCanvas} style={{display:'none'}} />

      {/* 현재 이미지 */}
      {value && !showCrop && (
        <div style={{marginBottom:12,display:'flex',alignItems:'center',gap:14}}>
          <div style={{position:'relative',width:88,height:116,borderRadius:10,overflow:'hidden',border:'2px solid #dee2e6',flexShrink:0}}>
            <img src={value} alt="프로필" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <p style={{fontSize:12,color:'#6c757d',margin:0}}>등록된 프로필 사진</p>
            <div style={{display:'flex',gap:8}}>
              <button type="button" onClick={()=>fileRef.current?.click()} style={{padding:'7px 14px',background:'#4263eb',color:'#fff',border:'none',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:600}}>변경</button>
              <button type="button" onClick={()=>onChange('')} style={{padding:'7px 14px',background:'#f1f3f5',color:'#6c757d',border:'1px solid #dee2e6',borderRadius:8,fontSize:12,cursor:'pointer'}}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {!showCrop && !value && (
        <button type="button" onClick={()=>fileRef.current?.click()} style={{padding:'16px',background:'#f8f9fa',border:'2px dashed #ced4da',borderRadius:12,color:'#868e96',fontSize:13,cursor:'pointer',width:'100%',textAlign:'center'}}>
          📷 사진 클릭하여 업로드 (최대 10MB)
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} />

      {/* 자유 크롭 편집기 */}
      {showCrop && rawPreview && (
        <div style={{background:'#fff',border:'1.5px solid #dee2e6',borderRadius:16,padding:18}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <p style={{fontSize:14,fontWeight:700,color:'#212529',margin:0}}>📐 노출 영역 조정</p>
            <p style={{fontSize:11,color:'#adb5bd'}}>밝은 영역이 명함에 표시됩니다</p>
          </div>
          <div
            style={{position:'relative',width:'100%',marginBottom:14,borderRadius:10,overflow:'hidden',cursor:dragRef.current?'grabbing':'default',userSelect:'none',background:'#000'}}
            ref={el => { if(el) setCanvasSize({ w: el.offsetWidth, h: Math.round(el.offsetWidth*1.1) }) }}
          >
            <canvas ref={previewCanvas} style={{display:'block',width:'100%',height:'auto',touchAction:'none'}}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
            {!imgReady && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13}}>이미지 로딩 중...</div>
            )}
          </div>
          <p style={{fontSize:11,color:'#adb5bd',marginBottom:12,textAlign:'center'}}>흰 모서리 핸들을 드래그해서 영역 조절 · 중앙 드래그해서 이동</p>
          <div style={{display:'flex',gap:8}}>
            <button type="button" onClick={doUpload} disabled={uploading||!imgReady} style={{flex:1,padding:'12px',background:uploading?'#adb5bd':'linear-gradient(135deg,#4263eb,#3b5bdb)',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:uploading||!imgReady?'not-allowed':'pointer'}}>
              {uploading?'⏳ 업로드 중...':!imgReady?'로딩 중...':'✓ 이 영역으로 저장'}
            </button>
            <button type="button" onClick={()=>{setShowCrop(false);setRawPreview(null);setCropFile(null);setImgReady(false)}} style={{padding:'12px 16px',background:'#f1f3f5',color:'#495057',border:'1px solid #dee2e6',borderRadius:10,fontSize:13,cursor:'pointer'}}>취소</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{fontSize:12,color:'#c92a2a',marginTop:8,padding:'8px 12px',background:'#fff5f5',border:'1px solid #ffc9c9',borderRadius:8}}>{error}</div>
      )}
    </div>
  )
}
