'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWorkoutAction } from './workout/new/actions'

interface Workout {
  id: string
  name: string
  duration: number | null
  exerciseCount: number
}

interface DashboardClientProps {
  selectedDate: string
  workouts: Workout[]
}

export function DashboardClient({ selectedDate, workouts }: DashboardClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const date = parseISO(selectedDate)

  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDaySelect(d: Date | undefined) {
    if (!d) return
    router.push(`${pathname}?date=${format(d, 'yyyy-MM-dd')}`)
    setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    const name = data.get('name') as string
    const durationRaw = data.get('duration') as string
    const notes = data.get('notes') as string

    startTransition(async () => {
      try {
        await createWorkoutAction({
          name,
          date: selectedDate,
          duration: durationRaw ? Number(durationRaw) : undefined,
          notes: notes || undefined,
        })
        setShowForm(false)
        router.refresh()
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    })
  }

  return (
    <div className="flex gap-8 items-start">
      {/* Left — calendar */}
      <div className="shrink-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDaySelect}
          captionLayout="label"
          className="rounded-lg border p-3"
        />
      </div>

      {/* Right — workouts panel */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            Workouts for {format(date, 'do MMMM yyyy')}
          </h2>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Log New Workout'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New workout</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Workout name</Label>
                  <Input id="name" name="name" required placeholder="e.g. Push Day" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" min={1} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" name="notes" placeholder="Optional" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : 'Save workout'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {workouts.length === 0 && !showForm ? (
          <p className="text-muted-foreground">No workouts logged for this date.</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
