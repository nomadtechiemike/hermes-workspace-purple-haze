import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { isAuthenticated } from '../../../server/auth-middleware'
import { updateProfileConfig } from '../../../server/profiles-browser'
import { syncProfileWrite } from '../../../server/profile-sync-orchestrator'
import { requireJsonContentType } from '../../../server/rate-limit'

export const Route = createFileRoute('/api/profiles/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthenticated(request)) {
          return json({ error: 'Unauthorized' }, { status: 401 })
        }
        const csrfCheck = requireJsonContentType(request)
        if (csrfCheck) return csrfCheck
        try {
          const body = (await request.json()) as {
            name?: string
            patch?: Record<string, unknown>
          }
          if (!body.patch || typeof body.patch !== 'object') {
            return json({ error: 'patch is required' }, { status: 400 })
          }
          const profile = updateProfileConfig(body.name || '', body.patch)
          const sync = await syncProfileWrite('update', {
            name: profile.name,
            patch: body.patch,
          })
          return json({ ok: true, profile, sync })
        } catch (error) {
          return json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update profile',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
