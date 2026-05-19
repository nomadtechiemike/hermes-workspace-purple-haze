import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { isAuthenticated } from '../../../server/auth-middleware'
import { createProfile } from '../../../server/profiles-browser'
import { syncProfileWrite } from '../../../server/profile-sync-orchestrator'
import { requireJsonContentType } from '../../../server/rate-limit'

export const Route = createFileRoute('/api/profiles/create')({
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
            cloneFrom?: string
            model?: string
            provider?: string
          }
          const profile = createProfile(body.name || '', {
            cloneFrom: body.cloneFrom,
            model: body.model,
            provider: body.provider,
          })
          const sync = await syncProfileWrite('create', {
            name: profile.name,
            cloneFrom: body.cloneFrom,
            model: body.model,
            provider: body.provider,
          })
          return json({
            ok: true,
            profile,
            sync,
          })
        } catch (error) {
          return json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to create profile',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
