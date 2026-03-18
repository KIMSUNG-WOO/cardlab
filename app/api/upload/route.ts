import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'card-images'
    const path = formData.get('path') as string

    if (!file || !path) {
      return NextResponse.json({ error: '파일 또는 경로가 없습니다.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })

    if (upErr) throw upErr

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e?.message ?? '업로드 실패' }, { status: 500 })
  }
}
