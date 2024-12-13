import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'

export default function authRoute() {
  router
    .group(() => {
      router.post('/register', [AuthController, 'register'])

    })
    .prefix('/auth')
}
