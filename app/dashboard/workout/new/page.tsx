import { getAuthUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWorkoutForm } from './CreateWorkoutForm'

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function NewWorkoutPage({ searchParams }: NewWorkoutPageProps) {
  await getAuthUser()
  const { date } = await searchParams
  const defaultDate = date ?? new Date().toISOString().slice(0, 10)

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>New workout</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWorkoutForm defaultDate={defaultDate} />
        </CardContent>
      </Card>
    </main>
  )
}
