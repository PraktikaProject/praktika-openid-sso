import vine from '@vinejs/vine'
import { v4 as uuidv4 } from 'uuid'
import type { HttpContext } from '@adonisjs/core/http'

import OpenIDClient from '#models/openid_client'
import OpenIDClientValidator from '#validators/openid_client'
import messagesProvider from '#helpers/validation_messages_provider'

export default class OpenidClientsController {
  async index({ response }: HttpContext) {
    try {
      const examples = await OpenIDClient.all()
      return response.ok({
        success: true,
        message: 'OpenID retrieved successfully.',
        data: examples,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to retrieve OpenID.',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const openidClient = await OpenIDClient.query().where('name', params.name).first()
      if (!openidClient) {
        return response.notFound({
          success: false,
          message: 'OpenID client not found.',
        })
      }

      return response.ok({
        success: true,
        message: 'OpenID client retrieved successfully.',
        data: openidClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'OpenID client failed to retrieve.',
        error: error.message,
      })
    }
  }

  async store({ request, response }: HttpContext) {
    const data = await vine
      .compile(OpenIDClientValidator.baseSchema)
      .validate(request.all(), { messagesProvider })

    try {
      const clientId = uuidv4()
      const clientSecret = uuidv4()
      const openIDClient = await OpenIDClient.create({
        ...data,
        clientId,
        clientSecret,
      })

      return response.created({
        success: true,
        message: 'OpenID client created successfully.',
        data: openIDClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to create OpenID client.',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const data = await vine
      .compile(OpenIDClientValidator.baseSchema)
      .validate(request.all(), { messagesProvider })

    try {
      const openIDClient = await OpenIDClient.query().where('name', params.name).first()
      if (!openIDClient) {
        return response.notFound({
          success: false,
          message: 'OpenID client not found.',
        })
      }

      const clientId = uuidv4()
      const clientSecret = uuidv4()
      await openIDClient
        .merge({
          ...data,
          clientId,
          clientSecret,
        })
        .save()
      return response.ok({
        success: true,
        message: 'OpenID client updated successfully.',
        data: openIDClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to update OpenID client.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const openIDClient = await OpenIDClient.query().where('name', params.name).first()
      if (!openIDClient) {
        return response.notFound({
          success: false,
          message: 'OpenID client not found.',
        })
      }

      await openIDClient.delete()
      return response.ok({
        success: true,
        message: 'OpenID client deleted successfully.',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to delete OpenID client.',
        error: error.message,
      })
    }
  }
}
