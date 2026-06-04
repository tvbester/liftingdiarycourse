# Authentication

## Provider — Clerk only

All authentication in this app **must** use [Clerk](https://clerk.com/). No exceptions.

**Never use:**
- NextAuth / Auth.js
- Custom JWT or session logic
- Any other authentication library or provider

## Reading the current user

The only way to read the authenticated user is via the `getAuthUser()` helper in `/lib/auth.ts`. Do not call Clerk APIs directly in pages, layouts, or data helpers.

```ts
import { getAuthUser } from '@/lib/auth'

const user = await getAuthUser() // redirects to /sign-in if unauthenticated
// user.id is the Clerk userId
```

`getAuthUser()` **always redirects to `/sign-in`** if there is no authenticated session — it never returns `null`. Call it at the top of any Server Component or `/data` helper that requires an authenticated user.

## Protecting pages and routes

Protect pages by calling `getAuthUser()` at the top of the Server Component. Do not use middleware-only protection as the sole guard — always enforce auth close to the data.

```tsx
// ✅ Correct — protected Server Component page
import { getAuthUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getAuthUser() // redirects if not signed in
  // ... render page
}
```

For routes that must be public (e.g. landing page, sign-in), simply do not call `getAuthUser()`.

## Clerk environment variables

Clerk requires two environment variables. These must be kept **server-side only** — never expose the secret key to the client.

| Variable | Where it lives |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client-safe (`NEXT_PUBLIC_` prefix) |
| `CLERK_SECRET_KEY` | Server only — never reference on the client |

## Sign-in and sign-up pages

Use Clerk's hosted or embedded UI components. Do **not** build custom sign-in/sign-up forms.

- Redirect unauthenticated users to `/sign-in`
- Configure `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` in `.env.local`

## Server Functions (Server Actions)

Every Server Function that accesses user data must call `getAuthUser()` internally. Never trust the client to pass a user ID.

```ts
// ✅ Correct — auth resolved inside the Server Function
'use server'
import { getAuthUser } from '@/lib/auth'

export async function createWorkout(formData: FormData) {
  const user = await getAuthUser()
  // use user.id to scope the write
}
```

```ts
// ❌ Wrong — userId supplied by the caller
'use server'
export async function createWorkout(userId: string, formData: FormData) {
  // caller controls userId — a different user's ID could be passed in
}
```

## Summary

| Concern | Rule |
|---|---|
| Auth provider | Clerk only |
| Reading current user | `getAuthUser()` from `/lib/auth` |
| Unauthenticated state | `getAuthUser()` redirects — never returns null |
| Page protection | Call `getAuthUser()` in the Server Component |
| Secret key | Server-side only — never in client code |
| Custom auth UI | Not allowed — use Clerk components |
