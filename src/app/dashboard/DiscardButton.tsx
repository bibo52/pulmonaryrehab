'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DiscardButton({ date }: { date: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDiscard() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/logs?date=${date}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (err) {
      console.error('Discard error:', err)
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <button
      onClick={handleDiscard}
      disabled={loading}
      className="text-sm text-[var(--terracotta)] hover:text-[var(--terracotta-light)] font-medium disabled:opacity-50"
    >
      {loading ? 'Discarding...' : confirming ? 'Tap again to confirm' : 'Discard workout'}
    </button>
  )
}
