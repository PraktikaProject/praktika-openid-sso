import vine from '@vinejs/vine'

export default class OpenIDClientValidator {
  static baseSchema = vine.object({
    name: vine.string(),
    redirectUri: vine.string(),
  })
}
