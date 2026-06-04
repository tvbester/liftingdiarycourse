# Routing

## Route structure

All application routes live under `/dashboard`. The root `/` route is public (landing page or redirect). There are no application routes outside of `/dashboard` and its sub-routes.

```
/                          → public (landing or redirect to /dashboard)
/sign-in                   → public (Clerk sign-in)
/sign-up                   → public (Clerk sign-up)
/dashboard                 → protected
/dashboard/workout/new     → protected
/dashboard/workout/[id]    → protected
```

## Route protection — middleware

All `/dashboard` routes are protected via Next.js middleware. The middleware runs before the page renders and redirects unauthenticated users to `/sign-in`.

Create a `middleware.ts` file at the project root:

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

## Defense in depth

Middleware is the first line of defense but **not the only one**. Every protected Server Component page must also call `getAuthUser()` at the top — see [auth.md](auth.md). This ensures auth is enforced close to the data even if the middleware matcher is misconfigured or bypassed.

```tsx
// ✅ Every /dashboard page must do this
import { getAuthUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getAuthUser() // redirects if not signed in
  // ...
}
```

## Adding new routes

When adding a new route under `/dashboard`:

1. Create the file at `app/dashboard/<route>/page.tsx`.
2. Call `getAuthUser()` at the top of the page — the middleware matcher covers it automatically.
3. No changes to `middleware.ts` are needed unless the route is outside `/dashboard`.

## Public routes

Routes that must remain public (landing page, Clerk sign-in/sign-up) must **not** call `getAuthUser()`. The middleware only protects `/dashboard(.*)`, so all other routes are public by default.
