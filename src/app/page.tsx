'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="decor-blob decor-blob-sage w-[400px] h-[400px] -top-48 -left-48 animate-breathe" />
      <div className="decor-blob decor-blob-terracotta w-[300px] h-[300px] -bottom-32 -right-32 animate-breathe" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="card p-10 animate-fade-in">
          {/* Logo/Icon area */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--sage-light)] to-[var(--sage)] mb-6 animate-float">
              <span className="text-5xl">🫁</span>
            </div>
            <h1 className="text-4xl mb-3">Welcome Back</h1>
            <p className="text-[var(--muted)] text-lg">
              Your daily wellness journey awaits
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-[var(--forest)] mb-3">
                Enter Your Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-[var(--accent-light)] text-[var(--terracotta)] p-4 rounded-2xl text-center font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>

          {/* Decorative footer */}
          <div className="mt-10 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Every breath counts. Every step matters.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
