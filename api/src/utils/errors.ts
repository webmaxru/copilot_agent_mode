/**
 * Error handling utilities for database operations
 */

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'DATABASE_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, id: string | number) {
    super(`${entity} with ID ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, field?: string) {
    super(`Validation error: ${message}`, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string) {
    super(`Conflict: ${message}`, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/**
 * Handle database errors and convert SQLite-specific errors to appropriate types
 */
export function handleDatabaseError(error: any, entity?: string, id?: string | number): never {
  // SQLite constraint violation (UNIQUE, FOREIGN KEY, etc.)
  if (error.code === 'SQLITE_CONSTRAINT') {
    if (error.message.includes('UNIQUE')) {
      throw new ConflictError('Resource already exists');
    }
    if (error.message.includes('FOREIGN KEY')) {
      throw new ValidationError('Invalid reference to related entity');
    }
    throw new ValidationError(error.message);
  }

  // SQLite busy/locked database
  if (error.code === 'SQLITE_BUSY') {
    throw new DatabaseError('Database is temporarily unavailable', 'DATABASE_BUSY', 503);
  }

  // Handle known application errors
  if (error instanceof DatabaseError) {
    throw error;
  }

  // Handle case where no rows were affected (for updates/deletes)
  if (error.message && error.message.includes('No rows affected') && entity && id) {
    throw new NotFoundError(entity, id);
  }

  // Default to generic database error
  throw new DatabaseError(`Database operation failed: ${error.message}`, 'DATABASE_ERROR', 500);
}

/**
 * Express error handler middleware for database errors
 */
export function errorHandler(error: any, req: any, res: any, next: any) {
  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', error.message);

  if (error instanceof DatabaseError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Default error handling - don't leak internal error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(isDevelopment && { details: error.message }), // Only show details in development
    },
  });
}
