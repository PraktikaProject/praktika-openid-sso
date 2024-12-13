import { HttpContext } from '@adonisjs/core/http'
import OpenIDService from '#services/openid_service'

export default class OpenIDsController {
  private openIDService = new OpenIDService()

  async authorize({ request, response }: HttpContext) {
    const {
      clientId,
      redirectUri,
      scope,
      responseType,
      state,
      nonce,
    } = request.qs()

    if (!clientId || !redirectUri || !scope || !state) {
      return response.unprocessableEntity({
        success: false,
        message: 'Missing required parameters.',
      })
    }

    if (responseType !== 'code') {
      return response.unauthorized({
        success: false,
        message: 'Invalid response_type. Only "code" is allowed.',
      })
    }

    const openIDClient = await this.openIDService.validateOpenIDClient(clientId, scope, redirectUri)
    if (!openIDClient) {
      return response.unauthorized({
        success: false,
        message: 'Invalid client_id, scope, or redirect_uri.',
      })
    }

    try {
      const authCode = await this.openIDService.generateAuthorizationCode(request.all(), openIDClient, scope, redirectUri, nonce, state)
      return response.ok({
        success: true,
        message: 'Authorization code generated successfully.',
        data: {
          uri: `${redirectUri}?code=${authCode.code}&state=${state}`,
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: error.message,
      })
    }
  }

  async token({ request, response, auth }: HttpContext) {
    const {
      grant_type: grantType,
      code,
      client_id: clientId,
      client_secret: clientSecret,
    } = request.qs()

    if (!grantType || !code || !clientId || !clientSecret) {
      return response.unprocessableEntity({
        success: false,
        message: 'Missing required parameters.',
      })
    }

    if (grantType !== 'authorization_code') {
      return response.unauthorized({
        success: false,
        message: 'Invalid grant_type. Only "authorization_code" is allowed.',
      })
    }

    try {
      const user = await this.openIDService.processTokenRequest(code, clientId, clientSecret)
      const token = await auth.use('jwt').generate(user)
      if (!token) {
        return response.unprocessableEntity({
          success: false,
          message: 'Failed to generate access token.',
        })
      }

      return response.ok({
        success: true,
        message: 'Login successful.',
        data: {
          token: token,
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: error.message,
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const userData = await auth.use('jwt').authenticate()
      return response.ok({
        success: true,
        user: userData,
      })
    } catch (error) {
      return response.unauthorized({
        success: false,
        message: 'Invalid token',
        error: error.message,
      })
    }
  }
}
