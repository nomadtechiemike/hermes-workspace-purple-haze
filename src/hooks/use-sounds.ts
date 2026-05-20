/**
 * React hook for sound notifications in ClawSuite
 * Provides system-level notification sound controls.
 */
import { useCallback, useMemo } from 'react'

import type { SoundEvent } from '@/lib/sounds'

import {
  getSoundVolume,
  isSoundEnabled,
  playAlert,
  playChatComplete,
  playChatNotification,
  playSound,
  playThinking,
  setSoundEnabled,
  setSoundVolume,
} from '@/lib/sounds'

interface UseSoundsOptions {
  /** Reserved for backward compatibility. */
  autoPlay?: boolean
  /** Reserved for backward compatibility. */
  thinkingThrottleMs?: number
}

interface UseSoundsReturn {
  // Play functions
  playChatNotification: () => void
  playChatComplete: () => void
  playAlert: () => void
  playThinking: () => void
  playSound: (event: SoundEvent) => void

  // Control functions
  volume: number
  setVolume: (vol: number) => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

/**
 * Hook that provides system-level sound functions and controls.
 */
export function useSounds(options: UseSoundsOptions = {}): UseSoundsReturn {
  void options

  // Stable callbacks
  const setVolume = useCallback((vol: number) => {
    setSoundVolume(vol)
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled)
  }, [])

  // Return memoized object for stable reference
  return useMemo(
    () => ({
      // Play functions (stable references from module)
      playChatNotification,
      playChatComplete,
      playAlert,
      playThinking,
      playSound,

      // Control
      volume: getSoundVolume(),
      setVolume,
      enabled: isSoundEnabled(),
      setEnabled,
    }),
    [setVolume, setEnabled],
  )
}

// Re-export types and functions for convenience
export type { SoundEvent }
export {
  playChatNotification,
  playChatComplete,
  playAlert,
  playThinking,
  setSoundVolume,
  setSoundEnabled,
  isSoundEnabled,
  getSoundVolume,
  playSound,
}
