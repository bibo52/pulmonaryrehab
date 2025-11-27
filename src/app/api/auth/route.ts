import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie, clearAuthCookie, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (verifyPassword(password)) {
    await setAuthCookie()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
}

export async function DELETE() {
  await clearAuthCookie()
  return NextResponse.json({ success: true })
}
