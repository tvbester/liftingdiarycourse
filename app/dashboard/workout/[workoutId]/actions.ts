'use server'

import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().date(),
  duration: z.coerce.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})

export async function updateWorkoutAction(params: {
  workoutId: string
  name: string
  date: string
  duration?: number
  notes?: string
}) {
  const parsed = UpdateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  const { workoutId, ...input } = parsed.data
  await updateWorkout(workoutId, input)
}
