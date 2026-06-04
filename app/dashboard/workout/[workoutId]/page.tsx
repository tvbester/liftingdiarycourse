import { notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { getWorkoutById } from '@/data/workouts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditWorkoutForm } from './EditWorkoutForm'

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  await getAuthUser()
  const { workoutId } = await params
  const workout = await getWorkoutById(workoutId)

  if (!workout) notFound()

  const defaultDate = workout.date.toISOString().slice(0, 10)

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit workout</CardTitle>
        </CardHeader>
        <CardContent>
          <EditWorkoutForm
            workoutId={workout.id}
            defaultName={workout.name}
            defaultDate={defaultDate}
            defaultDuration={workout.duration ?? undefined}
            defaultNotes={workout.notes ?? undefined}
          />
        </CardContent>
      </Card>
    </main>
  )
}
