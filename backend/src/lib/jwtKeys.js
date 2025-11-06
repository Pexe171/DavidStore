import crypto from 'crypto'
import config from '../../config/default.js'

const {
  security: {
    jwt: { keyRotationIntervalMinutes, keyRetention, keys: initialKeys }
  }
} = config

let keyRing = initialKeys.map(key => ({
  id: key.id,
  secret: key.secret,
  createdAt: new Date()
}))

if (!keyRing.length) {
  keyRing = [
    {
      id: `bootstrap-${Date.now()}`,
      secret: crypto.randomBytes(64).toString('hex'),
      createdAt: new Date()
    }
  ]
}

let activeKeyId = keyRing[0].id

export const getActiveKey = () => keyRing.find(key => key.id === activeKeyId)

export const getKeyById = id => keyRing.find(key => key.id === id)

export const getAllKeys = () => [...keyRing]

export const rotateKey = () => {
  const newKey = {
    id: `rot-${Date.now()}`,
    secret: crypto.randomBytes(64).toString('hex'),
    createdAt: new Date()
  }
  keyRing = [newKey, ...keyRing]
  activeKeyId = newKey.id
  if (keyRing.length > keyRetention) {
    keyRing = keyRing.slice(0, keyRetention)
  }
  return newKey
}

export const scheduleAutomaticRotation = () => {
  if (!keyRotationIntervalMinutes) {
    return null
  }
  const intervalMs = keyRotationIntervalMinutes * 60 * 1000
  return setInterval(() => {
    rotateKey()
  }, intervalMs)
}
