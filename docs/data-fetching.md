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

## Summary

| Concern | Rule |
|---|---|
| Where to fetch data | Server Components only |
| Where to write queries | `/data` helper functions only |
| Query tool | Drizzle ORM — no raw SQL |
| User scoping | Always resolved from session inside the helper, never passed in |
