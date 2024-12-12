import router from '@adonisjs/core/services/router'
import openIDClientsRoute from './openid_client_route.js'

export default function openIDRoute() {
  router
    .group(() => {
        openIDClientsRoute()
    })
    .prefix('/openid')
}
