import {
  dashboardFetch,
  gatewayFetch,
  getResolvedUrls,
} from './gateway-capabilities'

const PROFILE_SYNC_TIMEOUT_MS = 2_000

export type ProfileSyncAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'rename'
  | 'activate'

export type ProfileSyncPayload = {
  name?: string
  cloneFrom?: string
  model?: string
  provider?: string
  patch?: Record<string, unknown>
  oldName?: string
  newName?: string
}

export type ProfileSyncResult = {
  warnings: string[]
}

type Endpoint = 'dashboard' | 'core'

function requestFor(
  action: ProfileSyncAction,
  payload: ProfileSyncPayload,
): RequestInit {
  if (action === 'create') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        cloneFrom: payload.cloneFrom,
        model: payload.model,
        provider: payload.provider,
      }),
    }
  }
  if (action === 'update') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        patch: payload.patch || {},
      }),
    }
  }
  if (action === 'delete') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name }),
    }
  }
  if (action === 'rename') {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldName: payload.oldName,
        newName: payload.newName,
      }),
    }
  }
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: payload.name }),
  }
}

function pathFor(action: ProfileSyncAction): string {
  if (action === 'create') return '/api/profiles/create'
  if (action === 'update') return '/api/profiles/update'
  if (action === 'delete') return '/api/profiles/delete'
  if (action === 'rename') return '/api/profiles/rename'
  return '/api/profiles/activate'
}

async function mirrorToEndpoint(
  endpoint: Endpoint,
  action: ProfileSyncAction,
  payload: ProfileSyncPayload,
): Promise<string | null> {
  const fetcher = endpoint === 'dashboard' ? dashboardFetch : gatewayFetch
  const path = pathFor(action)
  const resolved = getResolvedUrls()
  const targetBase = endpoint === 'dashboard' ? resolved.dashboard : resolved.gateway
  try {
    const response = await fetcher(path, {
      ...requestFor(action, payload),
      signal: AbortSignal.timeout(PROFILE_SYNC_TIMEOUT_MS),
    })
    if (response.ok) return null

    const body = await response.text().catch(() => '')
    return `[${endpoint}] ${action} sync failed (${response.status}) @ ${targetBase}${path}${body ? `: ${body}` : ''}`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return `[${endpoint}] ${action} sync timed out or failed @ ${targetBase}${path}: ${message}`
  }
}

export async function syncProfileWrite(
  action: ProfileSyncAction,
  payload: ProfileSyncPayload,
): Promise<ProfileSyncResult> {
  const [dashboardWarning, coreWarning] = await Promise.all([
    mirrorToEndpoint('dashboard', action, payload),
    mirrorToEndpoint('core', action, payload),
  ])

  return {
    warnings: [dashboardWarning, coreWarning].filter(
      (value): value is string => Boolean(value),
    ),
  }
}
