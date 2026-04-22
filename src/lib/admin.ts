import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  }
  return { session }
}
