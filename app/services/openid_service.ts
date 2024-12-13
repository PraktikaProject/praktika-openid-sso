import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import vine from '@vinejs/vine'


import OpenIDClient from '#models/openid_client'
import AuthCode from '#models/auth_code'
import User from '#models/user'
import AuthValidator from '#validators/auth'
import messagesProvider from '#helpers/validation_messages_provider'

export default class OpenIDService {
  private validateScopes(requestedScopes: string, allowedScopes: string[]): string[] | null {
    const requested = requestedScopes.split(' ').filter(Boolean)
    if (requested.length === 0) return null
    const isValid = requested.every((scope) => allowedScopes.includes(scope))
    return isValid ? requested : null
  }

  async validateOpenIDClient(clientId: string, scopes: string, redirectUri: string) {
    const openIDClient = await OpenIDClient.findBy('client_id', clientId)    
    if (!openIDClient) return null

    const allowedScopes = openIDClient.allowedScopes.split(' ').map((s) => s.trim())
    const validScopes = this.validateScopes(scopes, allowedScopes)
    if (!validScopes) return null

    if (!openIDClient.redirectUri.startsWith('http')) {
      return null
    }
    const allowedUri = new URL(openIDClient.redirectUri)
    const requestedUri = new URL(redirectUri)
    if (
      allowedUri.origin !== requestedUri.origin ||
      !requestedUri.pathname.startsWith(allowedUri.pathname)
    ) {
      return null
    }
    return openIDClient
  }

  async generateAuthorizationCode(data: any, openIDClient: any, scope: string, redirectUri: string, nonce: string | null, state: string) {
    try {
      const validatedData = await vine
        .compile(AuthValidator.loginSchema)
        .validate(data, { messagesProvider })

      const user = await User.verifyCredentials(validatedData.myITSId, validatedData.password)
      if (!user) {
        throw new Error('Invalid credentials.')
      }

      const authCode = await AuthCode.create({
        code: uuidv4(),
        clientId: openIDClient.clientId,
        userId: user.id,
        scopes: scope,
        nonce: nonce || null,
        state: state,
        redirectUri: redirectUri,
        expiresAt: DateTime.utc().plus({ minutes: 5 }),
      })

      return authCode
    } catch (error) {
      throw new Error('Failed to authorize: ' + error.message)
    }
  }

  async processTokenRequest(code: string, clientId: string, clientSecret: string) {
    const openIDClient = await OpenIDClient.findBy('client_id', clientId)
    if (!openIDClient || openIDClient.clientSecret !== clientSecret) {
      throw new Error('Invalid client credentials.')
    }

    const authCode = await AuthCode.findBy('code', code)
    if (!authCode || authCode.clientId !== clientId) {
      throw new Error('Invalid authorization code.')
    }

    if (authCode.expiresAt <= DateTime.utc()) {
      await authCode.delete()
      throw new Error('Authorization code has expired.')
    }

    const user = await User.find(authCode.userId)
    if (!user) {
      throw new Error('Invalid user.')
    }

    await authCode.delete()
    return user
  }
}
