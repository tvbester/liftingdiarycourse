import { parse, format } from 'date-fns'
import { getAuthUser } from '@/lib/auth'
import { getWorkoutsForDate } from '@/data/workouts'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  await getAuthUser()
  const { date: dateParam } = await searchParams
  const date = dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date()
  const selectedDate = format(date, 'yyyy-MM-dd')

  const workouts = await getWorkoutsForDate(date)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workout Dashboard</h1>
      <DashboardClient
        selectedDate={selectedDate}
        workouts={workouts.map((w) => ({
          id: w.id,
          name: w.name,
          duration: w.duration ?? null,
          exerciseCount: Number(w.exerciseCount),
        }))}
      />
    </div>
  )
}
