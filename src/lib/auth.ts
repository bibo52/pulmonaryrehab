import { cookies } from 'next/headers'

const AUTH_COOKIE_NAME = 'pulmonary_rehab_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
  return authCookie?.value === 'authenticated'
}

export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export function verifyPassword(password: string): boolean {
  return password === process.env.AUTH_PASSWORD
}
