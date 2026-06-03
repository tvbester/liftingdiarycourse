import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const workouts = pgTable('workouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  date: timestamp('date').notNull(),
  duration: integer('duration'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const sets = pgTable('sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutExerciseId: uuid('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  weight: numeric('weight', { precision: 6, scale: 2 }),
  reps: integer('reps'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}))

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}))

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets: many(sets),
}))

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, { fields: [sets.workoutExerciseId], references: [workoutExercises.id] }),
}))
