'use server'

import { z } from 'zod'
import { createWorkout } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().date(),
  duration: z.coerce.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})

export async function createWorkoutAction(params: {
  name: string
  date: string
  duration?: number
  notes?: string
}) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  await createWorkout(parsed.data)
}
