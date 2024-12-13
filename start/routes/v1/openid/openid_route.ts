import OpenIDsController from '#controllers/openids_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

export default function openIdsRoute() {
  router
    .group(() => {
      router.post('/authorize', [OpenIDsController, 'authorize'])
      router.post('/token', [OpenIDsController, 'token'])
      router
        .group(() => {
          router.get('/me', [OpenIDsController, 'me'])
        })
        .middleware(middleware.auth({ guards: ['jwt'] }))
    })
}
