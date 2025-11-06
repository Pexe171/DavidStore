export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    if (details) {
      this.details = details
    }
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Dados inválidos.', details) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso não permitido.') {
    super(message, 403)
  }
}
