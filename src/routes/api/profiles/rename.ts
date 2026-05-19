import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { isAuthenticated } from '../../../server/auth-middleware'
import { renameProfile } from '../../../server/profiles-browser'
import { syncProfileWrite } from '../../../server/profile-sync-orchestrator'
import { requireJsonContentType } from '../../../server/rate-limit'

export const Route = createFileRoute('/api/profiles/rename')({
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
            oldName?: string
            newName?: string
          }
          const profile = renameProfile(body.oldName || '', body.newName || '')
          const sync = await syncProfileWrite('rename', {
            oldName: body.oldName,
            newName: body.newName,
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
                  : 'Failed to rename profile',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
