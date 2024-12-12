import OpenidClientsController from '#controllers/openid_clients_controller'
import router from '@adonisjs/core/services/router'

export default function openIDClientsRoute() {
  router
    .group(() => {
      router.get('/', [OpenidClientsController, 'index'])
      router.post('/', [OpenidClientsController, 'store'])
      router.get('/:name', [OpenidClientsController, 'show'])
      router.delete('/:name', [OpenidClientsController, 'destroy'])
      router.patch('/:name', [OpenidClientsController, 'update'])
    })
    .prefix('/openid/clients')
}
