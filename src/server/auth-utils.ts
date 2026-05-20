import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export type EffectiveAuthMode = {
  mode: 'env-bearer' | 'codex-bearer' | 'stateless'
  token: string
  source: 'env' | 'codex' | 'none'
}

type EffectiveAuthModeOptions = {
  bearerToken?: string
  allowCodexFallback?: boolean
}

function readCodexAccessToken(): string {
  try {
    const codexAuthPath = join(homedir(), '.codex', 'auth.json')
    if (!existsSync(codexAuthPath)) return ''
    const auth = JSON.parse(readFileSync(codexAuthPath, 'utf-8')) as {
      tokens?: { access_token?: string }
    }
    return typeof auth.tokens?.access_token === 'string'
      ? auth.tokens.access_token.trim()
      : ''
  } catch {
    return ''
  }
}

export function getEffectiveAuthMode(
  options: EffectiveAuthModeOptions = {},
): EffectiveAuthMode {
  const explicitBearer =
    typeof options.bearerToken === 'string' ? options.bearerToken.trim() : ''
  if (explicitBearer) {
    return {
      mode: 'env-bearer',
      token: explicitBearer,
      source: 'env',
    }
  }

  const envBearer =
    (process.env.HERMES_API_TOKEN || process.env.CLAUDE_API_TOKEN || '').trim()
  if (envBearer) {
    return {
      mode: 'env-bearer',
      token: envBearer,
      source: 'env',
    }
  }

  if (options.allowCodexFallback !== false) {
    const codexBearer = readCodexAccessToken()
    if (codexBearer) {
      return {
        mode: 'codex-bearer',
        token: codexBearer,
        source: 'codex',
      }
    }
  }

  return {
    mode: 'stateless',
    token: '',
    source: 'none',
  }
}

function normalizeBaseUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    const pathname = parsed.pathname.replace(/\/+$/, '')
    return `${parsed.origin}${pathname}`
  } catch {
    return null
  }
}

export function shouldForwardGatewayAuthorization(options: {
  baseUrl?: string
  gatewayUrl?: string
}): boolean {
  const baseUrl = (options.baseUrl || '').trim()
  if (!baseUrl) return true

  const gatewayUrl = (options.gatewayUrl || '').trim()
  if (!gatewayUrl) return false

  const normalizedTarget = normalizeBaseUrl(baseUrl)
  const normalizedGateway = normalizeBaseUrl(gatewayUrl)
  return Boolean(
    normalizedTarget && normalizedGateway && normalizedTarget === normalizedGateway,
  )
}