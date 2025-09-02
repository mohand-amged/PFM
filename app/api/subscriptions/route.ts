import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUserFromHeaders } from '@/lib/auth-service'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUserFromHeaders(request.headers)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(subscriptions)
  } catch (err) {
    console.error('GET /api/subscriptions error', err)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserFromHeaders(req.headers)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, price, billingDate, categories = [], description } = await req.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (price == null || isNaN(Number(price))) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
    }

    // billingDate must be a valid ISO date string or timestamp
    const date = new Date(billingDate)
    if (!billingDate || isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Valid billing date is required' }, { status: 400 })
    }

    const created = await prisma.subscription.create({
      data: {
        userId: user.id,
        name,
        price: Number(price),
        billingDate: date,
        categories: Array.isArray(categories) ? categories.map(String) : [],
        description: description ? String(description) : null,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('POST /api/subscriptions error', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
