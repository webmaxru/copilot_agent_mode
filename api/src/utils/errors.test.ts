import { describe, it, expect, vi } from 'vitest';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handleDatabaseError,
  errorHandler,
} from './errors';

describe('Error Classes', () => {
  describe('DatabaseError', () => {
    it('should create error with default values', () => {
      const error = new DatabaseError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with custom code and status', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 503);
      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with entity and id', () => {
      const error = new NotFoundError('User', 123);
      expect(error.message).toBe('User with ID 123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle string id', () => {
      const error = new NotFoundError('Product', 'abc-123');
      expect(error.message).toBe('Product with ID abc-123 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid email format');
      expect(error.message).toBe('Validation error: Invalid email format');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error with field', () => {
      const error = new ValidationError('Must be positive', 'price');
      expect(error.message).toBe('Validation error: Must be positive');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Conflict: Email already exists');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });
});

describe('handleDatabaseError', () => {
  it('should throw ConflictError for UNIQUE constraint violation', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'UNIQUE constraint failed: users.email',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ConflictError);
    expect(() => handleDatabaseError(sqliteError)).toThrow('Resource already exists');
  });

  it('should throw ValidationError for FOREIGN KEY constraint violation', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'FOREIGN KEY constraint failed',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
    expect(() => handleDatabaseError(sqliteError)).toThrow('Invalid reference to related entity');
  });

  it('should throw ValidationError for other constraint violations', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'CHECK constraint failed',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
  });

  it('should throw DatabaseError with 503 for busy database', () => {
    const sqliteError = {
      code: 'SQLITE_BUSY',
      message: 'Database is locked',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(DatabaseError);
    try {
      handleDatabaseError(sqliteError);
    } catch (error: any) {
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('DATABASE_BUSY');
    }
  });

  it('should rethrow existing DatabaseError', () => {
    const existingError = new NotFoundError('User', 1);

    expect(() => handleDatabaseError(existingError)).toThrow(NotFoundError);
    expect(() => handleDatabaseError(existingError)).toThrow('User with ID 1 not found');
  });

  it('should throw NotFoundError for no rows affected', () => {
    const error = {
      message: 'No rows affected',
    };

    expect(() => handleDatabaseError(error, 'Product', 123)).toThrow(NotFoundError);
    expect(() => handleDatabaseError(error, 'Product', 123)).toThrow('Product with ID 123 not found');
  });

  it('should throw generic DatabaseError for unknown errors', () => {
    const unknownError = {
      message: 'Something went wrong',
    };

    expect(() => handleDatabaseError(unknownError)).toThrow(DatabaseError);
    try {
      handleDatabaseError(unknownError);
    } catch (error: any) {
      expect(error.message).toContain('Database operation failed');
      expect(error.statusCode).toBe(500);
    }
  });
});

describe('errorHandler middleware', () => {
  it('should handle DatabaseError and return appropriate response', () => {
    const error = new NotFoundError('User', 123);
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'User with ID 123 not found',
      },
    });
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Invalid input');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error: Invalid input',
      },
    });
  });

  it('should handle ConflictError', () => {
    const error = new ConflictError('Resource exists');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Conflict: Resource exists',
      },
    });
  });

  it('should handle non-DatabaseError as internal error', () => {
    const error = new Error('Unexpected error');
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });
});
