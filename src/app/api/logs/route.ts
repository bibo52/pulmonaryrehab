import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const where: { date?: { gte?: Date; lte?: Date } } = {}
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  const logs = await prisma.dailyLog.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(logs)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const { date, ...rest } = data

  const log = await prisma.dailyLog.upsert({
    where: { date: new Date(date) },
    update: rest,
    create: { date: new Date(date), ...rest },
  })

  return NextResponse.json(log)
}
