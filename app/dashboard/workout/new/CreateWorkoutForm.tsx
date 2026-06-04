'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWorkoutAction } from './actions'

interface CreateWorkoutFormProps {
  defaultDate: string
}

export function CreateWorkoutForm({ defaultDate }: CreateWorkoutFormProps) {
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
        await createWorkoutAction({
          name,
          date,
          duration: durationRaw ? Number(durationRaw) : undefined,
          notes: notes || undefined,
        })
      } catch (err) {
        if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
          setError(err.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input id="name" name="name" required placeholder="e.g. Push Day" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" name="duration" type="number" min={1} placeholder="Optional" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" placeholder="Optional" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create workout'}
      </Button>
    </form>
  )
}
