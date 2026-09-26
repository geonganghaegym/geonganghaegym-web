# Repository Guidelines

## Project Structure & Module Organization
`src/` follows Feature-Sliced Design on top of Next.js 16 App Router. `src/app` contains routes, route groups like `(login-required)` and `(login-unrequired)`, providers, global styles, and API routes. `src/page` composes screens, `src/widget` holds layout and shared page sections, `src/feature` contains user-facing business flows, `src/entity` defines domain modules, and `src/shared` stores reusable API clients, UI, hooks, utils, and assets. Static files, fonts, the web manifest, and the Firebase messaging service worker live in `public/`. MSW mocks live in `src/shared/lib/mocks/`.

## Build, Test, and Development Commands
`npm run dev` starts the local app on port 3000.  
`npm run build` creates the production build, and `npm run start` serves it.  
`npm run lint` runs Next.js ESLint rules.  
`npm run lint:style` runs Stylelint on `src/**/*.tsx`.  
`npm run type-check` validates TypeScript with `tsconfig.prod.json`.  
`npm run test` runs Jest in `jsdom`.  
`npm run mock` starts the MSW mock server for API development.

## Coding Style & Naming Conventions
Use TypeScript with the `@/*` alias for `src/*` imports. Keep the FSD dependency direction downward: `shared -> entity -> feature -> widget -> page -> app`. Prettier enforces 2-space indentation, single quotes, semicolons, 90-character lines, and Tailwind class sorting. ESLint enforces import sorting, blocks `console`, and warns on `any`. Use PascalCase for React components, camelCase for hooks and utilities, and keep `index.ts` barrel exports in folders that already expose them.

## Testing Guidelines
Write tests with Jest and Testing Library as `*.test.ts` or `*.test.tsx`. Current examples are colocated with source files, such as `src/shared/utils/date.test.ts`, and in `src/shared/lib/__test__/`. Add tests for shared utilities, hooks, and role-specific UI flows when behavior changes. CI runs `npm run test` on every pull request; no repository-wide coverage threshold is configured, so cover the paths you modify.

## Commit & Pull Request Guidelines
Recent commits use conventional prefixes with short Korean summaries, for example `feat: 체험하기 기능 추가` and `fix: Base URL 변경`. Follow the same `type: summary` format for `feat`, `fix`, `edit`, `refactor`, and `test`. Before pushing, make sure `npm run type-check`, linting, and relevant tests pass. Husky also runs `npm run type-check` and `lint-staged` on commit. Use `.github/PULL_REQUEST_TEMPLATE.md` and complete `작업 개요`, `작업 상세 내용`, and `특이 사항`. Include linked issues and screenshots or GIFs for UI changes.

## Configuration Tips
Keep secrets in local `.env` files only. Common variables include `NEXT_PUBLIC_AUTH_URL`, `NEXT_PUBLIC_WEB_URI`, social login client IDs, `NEXT_PUBLIC_KAKAO_API_KEY`, and `NEXT_PUBLIC_API_MOCKING`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
