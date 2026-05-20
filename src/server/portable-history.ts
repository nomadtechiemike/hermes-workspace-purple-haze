import { getEffectiveAuthMode } from './auth-utils'

export type PortableHistoryMessage = {
  role: string
  content: string
}

function isForceReplayEnabled(): boolean {
  const raw = process.env.HERMES_WORKSPACE_FORCE_HISTORY
  if (!raw) return false
  const normalized = raw.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

export function shouldReplayPortableHistory(options?: {
  localBaseUrl?: string
  bearerToken?: string
}): boolean {
  if (isForceReplayEnabled()) return true

  const localBaseUrl = options?.localBaseUrl?.trim() || ''
  if (localBaseUrl) return true

  const auth = getEffectiveAuthMode({ bearerToken: options?.bearerToken })
  return auth.mode === 'stateless'
}

export function selectPortableConversationHistory(
  persistedHistory: Array<PortableHistoryMessage>,
  fallbackHistory: Array<PortableHistoryMessage>,
  options?: {
    localBaseUrl?: string
    bearerToken?: string
  },
): Array<PortableHistoryMessage> {
  if (!shouldReplayPortableHistory(options)) return []
  return persistedHistory.length > 0 ? persistedHistory : fallbackHistory
}
