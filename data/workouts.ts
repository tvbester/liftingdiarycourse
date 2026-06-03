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
