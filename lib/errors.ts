export class AuthenticationError extends Error {
  statusCode: number
  constructor(message: string = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
    this.statusCode = 401
  }
}

export class AuthorizationError extends Error {
  statusCode: number
  constructor(message: string = 'Authorization failed') {
    super(message)
    this.name = 'AuthorizationError'
    this.statusCode = 403
  }
}

export class ValidationError extends Error {
  statusCode: number
  field?: string
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
    this.field = field
  }
}

export class NotFoundError extends Error {
  statusCode: number
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

export class ConflictError extends Error {
  statusCode: number
  constructor(message: string = 'Resource already exists') {
    super(message)
    this.name = 'ConflictError'
    this.statusCode = 409
  }
}

export interface ErrorWithStatus extends Error {
  statusCode?: number
}

export function createErrorResponse(error: Error): { error: string; message: string; statusCode: number } {
  const errWithStatus = error as ErrorWithStatus
  return {
    error: error.name,
    message: error.message,
    statusCode: errWithStatus.statusCode || 500,
  }
}

export function createSuccessResponse<T>(data: T, message?: string): { success: true; data: T; message?: string } {
  return {
    success: true,
    data,
    message,
  }
}
