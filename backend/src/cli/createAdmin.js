#!/usr/bin/env node
import 'dotenv/config'

import bcrypt from 'bcryptjs'

import config from '../../config/default.js'
import prisma from '../lib/prisma.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

const parseArgs = () => {
  const args = process.argv.slice(2)
  return args.reduce((acc, current, index) => {
    if (!current.startsWith('--')) {
      return acc
    }
    const [flag, inlineValue] = current.split('=')
    const key = flag.replace(/^--/, '')
    if (inlineValue !== undefined) {
      acc[key] = inlineValue
      return acc
    }
    const nextValue = args[index + 1]
    if (nextValue && !nextValue.startsWith('--')) {
      acc[key] = nextValue
    } else {
      acc[key] = true
    }
    return acc
  }, {})
}

const ensureProvisioningToken = providedToken => {
  const configuredToken = process.env.ADMIN_PROVISIONING_TOKEN
  if (!configuredToken) {
    throw new Error(
      'Variável ADMIN_PROVISIONING_TOKEN ausente. Defina um token forte para autorizar a criação de administradores.'
    )
  }
  if (!providedToken) {
    throw new Error('Informe o token de provisão com --token=<valor> para prosseguir.')
  }
  if (providedToken !== configuredToken) {
    throw new Error('Token de provisão inválido. A criação foi bloqueada.')
  }
}

const validatePassword = password => {
  if (!password || password.length < 12) {
    throw new Error('A senha deve possuir no mínimo 12 caracteres.')
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    throw new Error('A senha deve conter letras maiúsculas e minúsculas.')
  }
  if (!/\d/.test(password)) {
    throw new Error('A senha deve conter ao menos um número.')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error('A senha deve conter ao menos um caractere especial.')
  }
}

const run = async () => {
  const args = parseArgs()
  const email = args.email || process.env.ADMIN_EMAIL
  const password = args.password || process.env.ADMIN_PASSWORD
  const name = args.name || process.env.ADMIN_NAME || 'Administração David Store'
  const token = args.token || process.env.ADMIN_PROVISIONING_TOKEN

  ensureProvisioningToken(token)

  if (!email || !emailRegex.test(email)) {
    throw new Error('Informe um e-mail válido utilizando --email=<valor>.')
  }

  validatePassword(password)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  const hashedPassword = await bcrypt.hash(password, config.security.saltRounds)

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
        role: 'admin'
      }
    })
    console.log('✅ Administrador atualizado com sucesso.')
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    })
    console.log('✅ Administrador criado com sucesso.')
  }
}

run()
  .catch(async error => {
    console.error(`❌ Falha ao provisionar administrador: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
