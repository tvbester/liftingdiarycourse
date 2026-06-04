# Data Fetching

## The only way to fetch data: Server Components

All data fetching in this app **must** be done via Server Components. No exceptions.

**Never fetch data via:**
- Route handlers (`app/api/*/route.ts`)
- Client Components (`'use client'`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side data-fetching library

**Always fetch data via:**
- `async` Server Components that call helper functions from `/data`

```tsx
// ✅ Correct — async Server Component calling a /data helper
import { getWorkoutsForUser } from '@/data/workouts'

export default async function WorkoutsPage() {
  const workouts = await getWorkoutsForUser()
  return <WorkoutList workouts={workouts} />
}
```

```tsx
// ❌ Wrong — fetching inside a Client Component
'use client'
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([])
  useEffect(() => { fetch('/api/workouts').then(...) }, [])
  ...
}
```

## Database queries: /data helpers with Drizzle ORM

All database queries must live in helper functions under the `/data` directory. These functions are the **only** place database access is allowed.

**Rules:**
- Use Drizzle ORM exclusively — **no raw SQL**
- Every helper must scope queries to the currently authenticated user
- Never accept a `userId` as a parameter from the caller — always resolve it from the session inside the helper

```ts
// ✅ Correct — data/workouts.ts
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

export async function getWorkoutsForUser() {
  const user = await getAuthUser() // resolves from session
  return db.select().from(workouts).where(eq(workouts.userId, user.id))
}
```

```ts
// ❌ Wrong — raw SQL
export async function getWorkoutsForUser(userId: string) {
  return db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`)
}
```

```ts
// ❌ Wrong — userId passed in by caller (caller could pass any ID)
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId))
}
```

## Authorization: users may only access their own data

This is a hard requirement. A logged-in user must **never** be able to read or write another user's data.

- Resolve the authenticated user inside every `/data` helper via the session
- Always filter queries by the authenticated user's ID
- Never trust a user-supplied ID to scope a query

If `getAuthUser()` returns null (unauthenticated), throw or redirect before executing any query — never fall through to an unscoped query.

```ts
export async function getWorkoutById(workoutId: string) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  // Drizzle query scoped to BOTH workoutId AND the authenticated userId
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))

  return workout ?? null // returns null if the workout belongs to someone else
}
```

## Handling missing resources — notFound()

When a `/data` helper returns `null` (record doesn't exist or belongs to another user), call `notFound()` from `next/navigation` in the Server Component. Do **not** render a fallback UI or throw a generic error.

```tsx
// ✅ Correct — app/dashboard/workout/[workoutId]/page.tsx
import { notFound } from 'next/navigation'
import { getWorkoutById } from '@/data/workouts'

export default async function EditWorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params
  const workout = await getWorkoutById(workoutId)

  if (!workout) notFound()  // renders the nearest not-found.tsx
  // ...
}
```

- `getWorkoutById` already scopes to the authenticated user, so a `null` return means either the record doesn't exist **or** it belongs to someone else — `notFound()` is the correct response for both cases.
- Never return a 200 with "workout not found" text. Always use `notFound()`.

## Dynamic route params

In Next.js 16, `params` is a `Promise` — always `await` it before reading properties.

```tsx
export default async function Page({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params  // ✅ must await
}
```

## Summary

| Concern | Rule |
|---|---|
| Where to fetch data | Server Components only |
| Where to write queries | `/data` helper functions only |
| Query tool | Drizzle ORM — no raw SQL |
| User scoping | Always resolved from session inside the helper, never passed in |
| Missing resource | Call `notFound()` — never render fallback UI |
| Dynamic params | Always `await params` before accessing properties |
