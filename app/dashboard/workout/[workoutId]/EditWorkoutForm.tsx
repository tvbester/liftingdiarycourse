'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateWorkoutAction } from './actions'

interface EditWorkoutFormProps {
  workoutId: string
  defaultName: string
  defaultDate: string
  defaultDuration?: number
  defaultNotes?: string
}

export function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultDate,
  defaultDuration,
  defaultNotes,
}: EditWorkoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)

    const name = data.get('name') as string
    const date = data.get('date') as string
    const durationRaw = data.get('duration') as string
    const notes = data.get('notes') as string

    startTransition(async () => {
      try {
        await updateWorkoutAction({
          workoutId,
          name,
          date,
          duration: durationRaw ? Number(durationRaw) : undefined,
          notes: notes || undefined,
        })
        router.push(`/dashboard?date=${date}`)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input id="name" name="name" required defaultValue={defaultName} placeholder="e.g. Push Day" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min={1}
          defaultValue={defaultDuration}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" defaultValue={defaultNotes} placeholder="Optional" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
