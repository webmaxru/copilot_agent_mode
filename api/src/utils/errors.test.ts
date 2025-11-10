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
    it('should create a database error with default values', () => {
      const error = new DatabaseError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create a database error with custom values', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 503);
      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error', () => {
      const error = new NotFoundError('User', 123);
      expect(error.message).toBe('User with ID 123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should work with string IDs', () => {
      const error = new NotFoundError('Product', 'abc-123');
      expect(error.message).toBe('Product with ID abc-123 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Validation error: Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('ConflictError', () => {
    it('should create a conflict error', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Conflict: Duplicate entry');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });
});

describe('handleDatabaseError', () => {
  it('should convert SQLITE_CONSTRAINT UNIQUE to ConflictError', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'UNIQUE constraint failed',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ConflictError);
    expect(() => handleDatabaseError(sqliteError)).toThrow('Resource already exists');
  });

  it('should convert SQLITE_CONSTRAINT FOREIGN KEY to ValidationError', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'FOREIGN KEY constraint failed',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
    expect(() => handleDatabaseError(sqliteError)).toThrow('Invalid reference to related entity');
  });

  it('should convert generic SQLITE_CONSTRAINT to ValidationError', () => {
    const sqliteError = {
      code: 'SQLITE_CONSTRAINT',
      message: 'Constraint failed',
    };

    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
  });

  it('should convert SQLITE_BUSY to DatabaseError with 503', () => {
    const sqliteError = {
      code: 'SQLITE_BUSY',
      message: 'Database is locked',
    };

    try {
      handleDatabaseError(sqliteError);
    } catch (error: any) {
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Database is temporarily unavailable');
    }
  });

  it('should re-throw DatabaseError instances', () => {
    const dbError = new NotFoundError('User', 123);

    expect(() => handleDatabaseError(dbError)).toThrow(NotFoundError);
  });

  it('should convert generic errors to DatabaseError', () => {
    const genericError = new Error('Something went wrong');

    expect(() => handleDatabaseError(genericError)).toThrow(DatabaseError);
    expect(() => handleDatabaseError(genericError)).toThrow('Database operation failed');
  });
});

describe('errorHandler middleware', () => {
  it('should handle DatabaseError', () => {
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

  it('should handle generic errors', () => {
    const error = new Error('Unknown error');
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
