# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

건강해짐 (To Be Healthy) — a fitness center schedule management PWA for trainers and members (students). Built with Next.js 16 App Router (React 19, Turbopack, Node 24).

## Commands

```bash
npm run dev          # Dev server on :3000
npm run build        # Production build
npm run lint         # ESLint 9 flat config (eslint.config.mjs) — `next lint`는 Next 16에서 제거됨
npm run lint:style   # Stylelint on TSX files
npm run type-check   # TypeScript check (tsconfig.prod.json)
npm run test         # Jest tests
npm run mock         # MSW Express mock server on :9090
```

Pre-commit hooks (Husky + lint-staged) run type-check, ESLint, Prettier, and Stylelint automatically.

## Architecture — FSD (Feature-Sliced Design)

```
src/
├── app/              # Next.js App Router (routes, providers, global styles)
├── page/             # Page-level compositions (combine features & widgets)
├── widget/           # Layout & composition components (navigation, pickers)
├── feature/          # Feature business logic (api/, hooks/, model/, ui/)
├── entity/           # Domain entities (auth, gym, diet, image, alarm)
└── shared/           # Reusable: api/, hooks/, ui/, utils/, mixin/, assets/
```

**Import rule**: layers can only import from layers below them (shared → entity → feature → widget → page → app).

Each feature/entity folder follows a consistent structure:
- `api/` — React Query queries and mutations
- `model/` — Zustand stores and TypeScript types
- `ui/` — React components
- `hooks/` — Custom hooks
- `index.ts` — Barrel exports

## Key Patterns

**Two user roles**: `STUDENT` and `TRAINER` — stored in `memberType`. Routes are split under `(login-required)/student/` and `(login-required)/trainer/`. Many components render differently per role.

**State management**: Zustand 5 with persist (localStorage key: `auth-storage`) and devtools middleware (disabled in production). Use `useAuthSelector` for optimized re-renders with shallow equality.

**Data fetching**: TanStack React Query v5 + Axios. Two Axios instances in `shared/api/baseApi.ts`:
- `api` — no auth header (public endpoints)
- `authApi` — attaches access token, handles 401 with token refresh

**API response wrapper**: All responses use `BaseResponse<T>` (`{ statusCode, message, data }`). Errors extend `BaseError` (AxiosError).

**UI components**: Shadcn/Radix UI in `shared/ui/`. Configured via `components.json` with aliases `@/shared` and `@/shared/utils/tw-utils`.

**Layout compound component**: `shared/ui/layout.tsx`(틀, 내비게이션 없음)와 `widget/layout.tsx`(역할별 하단 내비게이션을 붙인 래퍼). 페이지는 `<Layout type='student'>`(widget), feature·entity는 `@/shared/ui`의 `Layout`을 쓴다. `Layout.Header`, `Layout.Contents`, `Layout.BottomArea`.

**Typography**: Use constants from `shared/mixin/typography.ts` (e.g., `HEADING_1`, `TITLE_1`, `BODY_2`).

## Styling

- Tailwind CSS 4 — 설정은 `tailwind.config.js`가 아니라 `app/_styles/global.css`의 `@theme`에 있다. custom spacing scale (1=4px, 2=6px, 3=8px, 4=10px, 6=16px, 7=20px, 8=24px, 12=48px)
  - **v4 함정**: 숫자 유틸리티가 전부 동적으로 생성된다. v3에서 스케일에 없어 무시되던 클래스(`h-35` 등)가 갑자기 적용되고, `leading-N`도 spacing 스케일을 따라 `leading-4`=10px가 된다 — 줄 높이는 `leading-[16px]`처럼 명시한다
  - 유틸리티는 `@layer` 안에 있어 **레이어 밖 CSS(라이브러리 css, `react-calendar.css`)가 항상 이긴다**
- 달력은 react-day-picker 10(`shared/ui/calendar.tsx`). v10은 상태 클래스(selected·today·disabled)를 버튼이 아닌 셀(td)에 붙인다 — 버튼 스타일은 `[&>button]:`로 건다
- CSS variables for colors defined in `app/_styles/global.css` (e.g., `--primary-500`, `--gray-500`, `--point-color`)
- Pretendard font (Korean-optimized)
- Max layout width: 440px (mobile-first)
- `cn()` utility from `shared/utils/tw-utils.ts` for merging Tailwind classes
- Prettier plugin auto-sorts Tailwind classes

## Code Conventions

- Path alias: `@/*` → `./src/*`
- Import sorting enforced by `simple-import-sort` ESLint plugin
- `no-console: error` — no console.log in committed code
- `@typescript-eslint/no-explicit-any: warn`
- Prettier: single quotes, 90 print width, trailing commas (es5), JSX single quotes
- SVGs imported as React components via `@svgr/webpack`

## Environment Variables

Key env var: `NEXT_PUBLIC_AUTH_URL` — backend API base URL (proxied via Next.js rewrites in `next.config.mjs`).
