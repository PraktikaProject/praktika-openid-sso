import vine from '@vinejs/vine'

export default class OpenIDClientValidator {
  static baseSchema = vine.object({
    name: vine.string(),
    redirect_uri: vine.string(),
  })
}
