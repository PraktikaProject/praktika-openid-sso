import router from '@adonisjs/core/services/router'
import openIDClientsRoute from './openid_client_route.js'
import openIdRoute from './openid_route.js'
import authRoute from './auth_route.js'

export default function openIDRoute() {
  router
    .group(() => {
        authRoute()
        openIdRoute()
        openIDClientsRoute()
    })
    .prefix('/openid')
}
