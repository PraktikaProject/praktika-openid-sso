import router from '@adonisjs/core/services/router'
import openIDRoute from './openid/index.js'

export default function v1Route() {
  router
    .group(() => {
        openIDRoute()
    })
    .prefix('/v1')
}
