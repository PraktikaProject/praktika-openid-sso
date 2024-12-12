import { v4 as uuidv4 } from 'uuid'

export function randomIdGenerator(length: number): string {
  let clientId = uuidv4()
  return clientId.slice(0, length)
}
