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
        message: 'Examples retrieved successfully.',
        data: examples,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to retrieve examples.',
        error: error.message,
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const oauthClient = await OpenIDClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      return response.ok({
        success: true,
        message: 'Oauth client retrieved successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Oauth client failed to retrieve.',
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
      const oauthClient = await OpenIDClient.create({
        ...data,
        client_id: clientId,
        client_secret: clientSecret,
      })

      return response.created({
        success: true,
        message: 'Oauth client created successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to create oauth client.',
        error: error.message,
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const data = await vine
      .compile(OpenIDClientValidator.baseSchema)
      .validate(request.all(), { messagesProvider })

    try {
      const oauthClient = await OpenIDClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      const clientId = uuidv4()
      const clientSecret = uuidv4()
      await oauthClient
        .merge({
          ...data,
          client_id: clientId,
          client_secret: clientSecret,
        })
        .save()
      return response.ok({
        success: true,
        message: 'Oauth client updated successfully.',
        data: oauthClient,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to update oauth client.',
        error: error.message,
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const oauthClient = await OpenIDClient.query().where('name', params.name).first()
      if (!oauthClient) {
        return response.notFound({
          success: false,
          message: 'Oauth client not found.',
        })
      }

      await oauthClient.delete()
      return response.ok({
        success: true,
        message: 'Oauth client deleted successfully.',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to delete oauth client.',
        error: error.message,
      })
    }
  }
}
