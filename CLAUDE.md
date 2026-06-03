# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Always consult /docs first

Before generating any code, **always read the relevant documentation file in the `/docs` directory** for the area you are working in. These docs define the intended design, patterns, and conventions for this project — they take precedence over general knowledge or defaults.

Check `/docs` for a file matching the domain (e.g., `ui.md` for UI work, `auth.md` for authentication, etc.) and follow its guidance before writing any code.

## Commands

```bash
npm run dev      # Start dev server (Turbopack) at localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

> `next build` does **not** run the linter automatically (changed in Next.js 16). Run lint separately.

## Architecture

This is a **Next.js 16** app using the **App Router** with React 19, TypeScript, and Tailwind CSS v4.

- `app/` — All routes. Files named `page.tsx` define route UIs; `layout.tsx` wraps children. No `pages/` directory.
- `app/globals.css` — Global styles. Uses `@import "tailwindcss"` (Tailwind v4 syntax, not `@tailwind base/components/utilities`).
- `@/` alias maps to the project root (configured in `tsconfig.json`).

## Key Next.js 16 patterns

**Server vs Client Components**
- All components are Server Components by default. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs.
- Push `'use client'` as deep in the tree as possible to minimize client bundle size.
- React context requires a Client Component wrapper; render it as deep in the tree as possible.

**Data fetching (Server Components)**
- Fetch directly inside async Server Components using `fetch` or an ORM — credentials stay server-side.
- `fetch` results are **not cached by default**. Use the `use cache` directive to cache, or wrap in `<Suspense>` to stream.
- Identical `fetch` calls within a render tree are automatically memoized (no prop-drilling needed).

**Mutations (Server Functions / Server Actions)**
- Use `'use server'` directive inside async functions or at the top of a file to mark Server Functions.
- Always verify authentication/authorization inside every Server Function — they are reachable via direct POST requests.
- Pass Server Functions to `<form action={...}>` or `<button formAction={...}>` for automatic `startTransition` wrapping.

**Environment variables**
- Only `NEXT_PUBLIC_*` variables are included in the client bundle. All others are server-only and replaced with empty strings on the client.
- Use `import 'server-only'` in modules that must never reach the client.

**Dynamic routes**
- `params` in page/layout components is a `Promise` in Next.js 16 — always `await params` before accessing properties:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```

**Turbopack** is the default bundler for `next dev`. Use `next dev --webpack` to opt out.
