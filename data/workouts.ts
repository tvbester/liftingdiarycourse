import { db } from '@/src/db'
import { workouts, workoutExercises } from '@/src/db/schema'
import { eq, and, gte, lt, count } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth'

export async function getWorkoutsForDate(date: Date) {
  const user = await getAuthUser()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const rows = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      duration: workouts.duration,
      exerciseCount: count(workoutExercises.id),
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workouts.userId, user.id),
        gte(workouts.date, startOfDay),
        lt(workouts.date, endOfDay)
      )
    )
    .groupBy(workouts.id, workouts.name, workouts.duration)

  return rows
}

export async function getWorkoutById(workoutId: string) {
  const user = await getAuthUser()
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
  return workout ?? null
}

export async function updateWorkout(workoutId: string, input: { name: string; date: string; duration?: number; notes?: string }) {
  const user = await getAuthUser()
  await db
    .update(workouts)
    .set({
      name: input.name,
      date: new Date(input.date),
      duration: input.duration ?? null,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, user.id)))
}

export async function createWorkout(input: { name: string; date: string; duration?: number; notes?: string }) {
  const user = await getAuthUser()
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: user.id,
      name: input.name,
      date: new Date(input.date),
      duration: input.duration,
      notes: input.notes,
    })
    .returning({ id: workouts.id })
  return workout
}
