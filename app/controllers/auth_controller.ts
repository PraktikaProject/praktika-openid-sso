import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

import User from '#models/user'
import AuthValidator from '#validators/auth'
import messagesProvider from '#helpers/validation_messages_provider'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await vine
      .compile(AuthValidator.registerSchema)
      .validate(request.all(), { messagesProvider })

    try {
      if (await User.query().where('myITSId', '=', data.myITSId).first()) {
        return response.conflict({
          success: false,
          message: 'The myITSId has already been taken.',
        })
      }
     await User.create(data)
      return response.created({
        success: true,
        message: 'User registered successfully.',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'An error occurred during registration.',
        error: error.message,
      })
    }
  }
}
