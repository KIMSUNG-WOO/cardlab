# Supabase 관리자 계정 설정 가이드

## 1. Supabase Auth에 관리자 계정 등록

Supabase Dashboard에서 아래 순서로 진행하세요.

### 방법 A: Dashboard UI 사용 (권장)
1. Supabase Dashboard 접속
2. 왼쪽 메뉴 > **Authentication** > **Users**
3. 우상단 **Add user** 버튼 클릭
4. 아래 정보 입력:
   - Email: `dkdl137900@cardlab.admin`
   - Password: `9004okok!!`
   - **Auto Confirm User: 체크** (이메일 인증 건너뜀)
5. **Create User** 클릭

### 방법 B: SQL Editor 사용
```sql
-- Supabase Dashboard > SQL Editor 에서 실행
-- (auth.users는 직접 수정 불가 — Dashboard UI 사용 권장)
```

## 2. 로그인 방법

CardLab 관리자 로그인 페이지(`/admin/login`)에서:
- **아이디**: `dkdl137900`
- **비밀번호**: `9004okok!!`

> 내부적으로 아이디를 `dkdl137900@cardlab.admin` 이메일로 변환하여 Supabase Auth에 인증합니다.

## 3. 이메일 확인 설정 비활성화

Supabase Dashboard > Authentication > **Providers** > Email 에서:
- **Confirm email**: 비활성화 (로컬/개발 환경)

또는 Dashboard > Authentication > **Settings**:
- **Enable email confirmations**: OFF

## 4. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:
```bash
cp .env.local.example .env.local
```

그리고 아래 값을 채워넣으세요:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

값은 Supabase Dashboard > **Project Settings** > **API** 에서 확인 가능합니다.
