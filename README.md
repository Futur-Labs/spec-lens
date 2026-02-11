# SpecLens

OpenAPI/Swagger 스펙을 시각화하고 API를 테스트할 수 있는 뷰어

## 주요 기능

- **스펙 로딩**: JSON 파일 업로드 또는 URL 입력으로 OpenAPI 스펙 로드
- **API 시각화**: 엔드포인트 목록, 파라미터, 스키마 등 시각적으로 표시
- **API 테스트**: Try it out 기능으로 실제 API 호출 테스트 (서버 프록시 기반)
- **스펙 변경 감지**: ETag/Last-Modified 기반 업데이트 확인
- **다크 테마**: 눈이 편한 다크 모드 UI

## 지원 포맷

- OpenAPI 3.0.x JSON

## 기술 스택

- **Framework**: TanStack Start (React meta-framework with SSR)
- **Routing**: TanStack Router (file-based routing)
- **State Management**: Zustand
- **Server State**: TanStack Query
- **Database**: Prisma + SQLite (libsql adapter)
- **Build**: Vite + Nitro

## 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 프로덕션 빌드

```bash
pnpm build
```

### 프로덕션 빌드 미리보기

```bash
pnpm preview
```

## 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm preview` | 프로덕션 빌드 미리보기 |
| `pnpm lint` | ESLint 검사 |
| `pnpm lint:fix` | ESLint 자동 수정 |
| `pnpm db:generate` | Prisma 클라이언트 생성 |
| `pnpm db:migrate` | 마이그레이션 실행 |
| `pnpm db:studio` | Prisma Studio 열기 |

## 프로젝트 구조

```
src/
├── app/             # 앱 레벨 provider/declare
├── routes/          # 파일 기반 라우트 (/, /api-docs, /robots.txt, /sitemap.xml)
├── pages/           # 페이지 컴포넌트 (spec-loader, viewer, root)
├── features/        # 기능 단위 모듈 (spec-import, api-tester)
├── entities/        # 도메인 상태/타입/로직 (openapi-spec 등)
└── shared/          # 공용 유틸/UI/서버 함수

server/
└── pm2/             # PM2 실행 스크립트/설정

prisma/
├── schema.prisma    # DB 스키마
├── migrations/      # 마이그레이션
└── seed.ts          # 시드 스크립트
```

## 라이선스

MIT
