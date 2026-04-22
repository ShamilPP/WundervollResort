import { NextResponse } from 'next/server'
import { getUnavailableRanges } from '@/lib/availability'

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const data = await getUnavailableRanges(
    params.id,
    from ? new Date(from) : undefined,
    to ? new Date(to) : undefined,
  )
  return NextResponse.json(data)
}
