import { parse } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from './DatePicker'
import { getWorkoutsForDate } from '@/data/workouts'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const date = dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date()

  const workouts = await getWorkoutsForDate(date)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Showing workouts for</span>
        <DatePicker selected={date} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Workouts</h2>
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts logged for this date.</p>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{workout.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                  {workout.duration != null ? ` · ${workout.duration} min` : ''}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
