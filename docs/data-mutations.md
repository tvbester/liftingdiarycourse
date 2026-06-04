# Data Mutations

## The only way to mutate data: Server Actions calling /data helpers

All data mutations in this app **must** go through two layers:

1. A **Server Action** in a colocated `actions.ts` file — validates input and calls a `/data` helper
2. A **`/data` helper function** — the only place Drizzle ORM write calls are allowed

**Never mutate data via:**
- Route handlers (`app/api/*/route.ts`)
- Client-side `fetch` / third-party mutation libraries
- Drizzle ORM calls outside of `/data` helpers (including directly inside Server Actions)
- `FormData` params in Server Actions

## Layer 1 — Server Actions in actions.ts

Every Server Action must live in a file named `actions.ts`, colocated with the route or feature it belongs to.

```
app/
  dashboard/
    actions.ts   ✅ colocated with the dashboard route
    page.tsx
  workouts/
    [id]/
      actions.ts ✅ colocated with the workout detail route
      page.tsx
```

**Rules:**
- File must include `'use server'` at the top
- Every action must validate its arguments with **Zod** before doing anything else
- Params must be **typed** — never use `FormData` as a parameter type
- Call a `/data` helper for the actual DB write — no Drizzle calls inside actions
- Always call `getAuthUser()` (or rely on the `/data` helper to do so) — never trust the caller to supply a user ID

```ts
// ✅ Correct — app/workouts/actions.ts
'use server'

import { z } from 'zod'
import { createWorkout } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().date(),
})

export async function createWorkoutAction(params: {
  name: string
  date: string
}) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  return createWorkout(parsed.data)
}
```

```ts
// ❌ Wrong — FormData param
export async function createWorkoutAction(formData: FormData) { ... }
```

```ts
// ❌ Wrong — Drizzle call inside the action (bypasses the /data layer)
'use server'
import { db } from '@/db'
export async function createWorkoutAction(params: { name: string }) {
  await db.insert(workouts).values({ name: params.name })
}
```

```ts
// ❌ Wrong — no Zod validation
'use server'
export async function createWorkoutAction(params: { name: string }) {
  return createWorkout(params) // params are unvalidated
}
```

## Layer 2 — /data helpers with Drizzle ORM

All Drizzle write calls (`insert`, `update`, `delete`) must live in helper functions under the `/data` directory.

**Rules:**
- Use Drizzle ORM exclusively — **no raw SQL**
- Every helper must resolve the authenticated user from the session via `getAuthUser()` — never accept a `userId` from the caller
- Always scope writes to the authenticated user's ID to prevent one user from mutating another's data

```ts
// ✅ Correct — data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { getAuthUser } from '@/lib/auth'

export async function createWorkout(input: { name: string; date: string }) {
  const user = await getAuthUser()
  return db.insert(workouts).values({ ...input, userId: user.id })
}

export async function deleteWorkout(workoutId: string) {
  const user = await getAuthUser()
  // Scope delete to BOTH workoutId AND userId — prevents deleting another user's workout
  return db.delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
}
```

```ts
// ❌ Wrong — userId accepted from the caller
export async function createWorkout(userId: string, input: { name: string }) {
  return db.insert(workouts).values({ ...input, userId })
}
```

```ts
// ❌ Wrong — raw SQL
export async function deleteWorkout(workoutId: string) {
  return db.execute(sql`DELETE FROM workouts WHERE id = ${workoutId}`)
}
```

## Zod schemas

Define Zod schemas at the top of the `actions.ts` file, co-located with the action that uses them. Do not share schemas across files unless they represent the same domain object.

```ts
// ✅ Correct — schema defined at the top of actions.ts
const UpdateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().date(),
})
```

Always use `safeParse` so you can return a typed error rather than throw unexpectedly:

```ts
const parsed = UpdateWorkoutSchema.safeParse(params)
if (!parsed.success) throw new Error('Invalid input')
```

## Calling Server Actions from the client

Pass Server Actions directly to event handlers or form actions — do not wrap them in an extra `fetch` call.

```tsx
// ✅ Correct — pass action directly to a button
'use client'
import { createWorkoutAction } from './actions'

export function CreateWorkoutButton() {
  return (
    <button onClick={() => createWorkoutAction({ name: 'Leg Day', date: '2026-06-03' })}>
      Create
    </button>
  )
}
```

## Redirects after mutations

Never call `redirect()` inside a Server Action. Redirects must be handled client-side after the Server Action resolves.

**Why:** `redirect()` works by throwing a special error internally. When thrown inside a Server Action that is called from a Client Component, it bypasses the client's error handling and produces hydration mismatches and unpredictable behaviour. Keeping redirects on the client gives the caller full control over navigation and error handling.

```ts
// ❌ Wrong — redirect inside a Server Action
'use server'
import { redirect } from 'next/navigation'

export async function createWorkoutAction(params: { name: string; date: string }) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')
  await createWorkout(parsed.data)
  redirect(`/dashboard?date=${params.date}`) // ❌ never do this
}
```

```ts
// ✅ Correct — Server Action returns, client redirects
'use server'

export async function createWorkoutAction(params: { name: string; date: string }) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')
  await createWorkout(parsed.data)
  // no redirect — return normally
}
```

```tsx
// ✅ Correct — client handles the redirect after the action resolves
'use client'
import { useRouter } from 'next/navigation'
import { createWorkoutAction } from './actions'

export function CreateWorkoutForm({ date }: { date: string }) {
  const router = useRouter()

  async function handleSubmit(name: string) {
    await createWorkoutAction({ name, date })
    router.push(`/dashboard?date=${date}`) // ✅ redirect here, on the client
  }

  // ...
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to write mutations | `/data` helper functions only (Drizzle calls) |
| Where to define Server Actions | Colocated `actions.ts` files |
| Server Action params | Typed — never `FormData` |
| Input validation | Zod in every Server Action, before anything else |
| Auth in mutations | `getAuthUser()` inside the `/data` helper — never trust a caller-supplied userId |
| Query tool | Drizzle ORM — no raw SQL |
| Redirects after mutations | Client-side only — never call `redirect()` inside a Server Action |
