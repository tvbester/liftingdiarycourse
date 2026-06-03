import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function getAuthUser() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return { id: userId }
}
