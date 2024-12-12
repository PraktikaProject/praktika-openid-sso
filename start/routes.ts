/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import v1Route from './routes/v1/index.js'
import { HttpContext } from '@adonisjs/core/http'

router.get('/', async ({ response }: HttpContext) => {
  response.status(200).json({
    status: 200,
    message: 'Welcome to Adonis Api OpenID!',
  })
})

router
  .group(() => {
    v1Route()
  })
  .prefix('/api/v1')

