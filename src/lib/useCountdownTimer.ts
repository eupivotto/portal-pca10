import { useEffect, useRef, useState } from 'react'

export function useCountdownTimer(totalSeconds: number, running: boolean, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          onExpireRef.current()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  return secondsLeft
}

export function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
