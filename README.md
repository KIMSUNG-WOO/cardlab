# CardLab — 디지털 명함 플랫폼

## 기술 스택
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS** + **Framer Motion**
- **Vercel** 배포

---

## 1. 로컬 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 열어서 Supabase URL/Key 입력

# 개발 서버 실행
npm run dev
```

http://localhost:3000 접속

---

## 2. Supabase 설정

### 2-1. 프로젝트 생성
1. https://supabase.com 접속 후 새 프로젝트 생성
2. **Project Settings > API** 에서 URL과 anon key 복사
3. `.env.local`에 붙여넣기

### 2-2. 스키마 실행
1. Supabase Dashboard > **SQL Editor** > **New query**
2. `supabase/schema.sql` 내용 전체 복사 후 붙여넣기
3. **Run** 클릭

### 2-3. 관리자 계정 등록
`supabase/setup-auth.md` 파일 참고

### 2-4. Storage 버킷 생성 (이미지 업로드용)
1. Supabase Dashboard > **Storage** > **New bucket**
2. 버킷명: `card-images`
3. **Public bucket**: 체크 (공개)
4. **Create bucket** 클릭

---

## 3. Vercel 배포

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 배포
vercel

# 환경변수는 Vercel Dashboard > Settings > Environment Variables 에 추가
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_SITE_URL=https://cardlab.digital
```

또는 GitHub 연동 후 push 시 자동 배포

---

## 4. 사용 방법

### 관리자
1. `https://cardlab.digital/admin/login` 접속
2. 아이디: `dkdl137900` / 비밀번호: `9004okok!!`
3. 대시보드에서 명함 생성/수정/삭제

### 명함 페이지
- `https://cardlab.digital/slug명` 으로 접속

---

## 5. 새 템플릿 추가 방법

1. `lib/templates.ts` 의 `TEMPLATES` 객체에 새 항목 추가
2. `components/templates/` 에 새 템플릿 컴포넌트 파일 생성
3. `app/[slug]/page.tsx` 의 switch 문에 case 추가

---

## 6. 폴더 구조

```
cardlab/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 랜딩 페이지 (/)
│   ├── [slug]/
│   │   ├── page.tsx            # 공개 명함 페이지
│   │   └── not-found.tsx       # 404
│   └── admin/
│       ├── layout.tsx
│       ├── login/page.tsx      # 로그인
│       ├── dashboard/page.tsx  # 대시보드
│       └── cards/
│           ├── new/page.tsx    # 명함 생성
│           └── [id]/page.tsx   # 명함 수정
├── components/
│   ├── admin/
│   │   ├── login-form.tsx
│   │   ├── admin-header.tsx
│   │   ├── card-list.tsx
│   │   └── card-form.tsx
│   └── templates/
│       ├── authentic-finance-card.tsx  # AFG 템플릿
│       └── minimal-dark-card.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   └── server.ts           # 서버 클라이언트
│   ├── types.ts
│   ├── templates.ts            # 템플릿 시스템
│   └── utils.ts
├── middleware.ts               # 인증 미들웨어
└── supabase/
    ├── schema.sql
    └── setup-auth.md
```

---

## 7. 오류 방지 체크리스트

- [ ] `.env.local`에 Supabase URL/Key 입력 완료
- [ ] Supabase SQL Editor에서 `schema.sql` 실행 완료
- [ ] Supabase Auth에 관리자 계정 등록 완료 (이메일 확인 비활성화)
- [ ] Supabase Storage `card-images` 버킷 생성 완료
- [ ] `npm install` 완료 후 `npm run dev` 실행
- [ ] `/admin/login` 에서 로그인 테스트 완료
- [ ] 명함 생성 후 `/{slug}` 접근 테스트 완료
- [ ] Vercel 배포 시 환경변수 추가 완료
- [ ] Supabase Dashboard > Auth > Email Confirmations OFF
