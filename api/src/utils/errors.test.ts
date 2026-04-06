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
    it('should create with default code and status', () => {
      const error = new DatabaseError('Something failed');
      expect(error.message).toBe('Something failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create with custom code and status', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 503);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create with entity and numeric id', () => {
      const error = new NotFoundError('Product', 42);
      expect(error.message).toBe('Product with ID 42 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(DatabaseError);
    });

    it('should create with entity and string id', () => {
      const error = new NotFoundError('User', 'abc-123');
      expect(error.message).toBe('User with ID abc-123 not found');
    });
  });

  describe('ValidationError', () => {
    it('should create with message', () => {
      const error = new ValidationError('Invalid email');
      expect(error.message).toBe('Validation error: Invalid email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(DatabaseError);
    });

    it('should create with optional field parameter', () => {
      const error = new ValidationError('Required', 'email');
      expect(error.message).toBe('Validation error: Required');
    });
  });

  describe('ConflictError', () => {
    it('should create with message', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Conflict: Duplicate entry');
      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });
});

describe('handleDatabaseError', () => {
  it('should throw ConflictError for UNIQUE constraint violation', () => {
    const sqliteError = { code: 'SQLITE_CONSTRAINT', message: 'UNIQUE constraint failed' };
    expect(() => handleDatabaseError(sqliteError)).toThrow(ConflictError);
  });

  it('should throw ValidationError for FOREIGN KEY constraint violation', () => {
    const sqliteError = { code: 'SQLITE_CONSTRAINT', message: 'FOREIGN KEY constraint failed' };
    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
  });

  it('should throw ValidationError for other SQLITE_CONSTRAINT errors', () => {
    const sqliteError = { code: 'SQLITE_CONSTRAINT', message: 'CHECK constraint failed' };
    expect(() => handleDatabaseError(sqliteError)).toThrow(ValidationError);
  });

  it('should throw DatabaseError with 503 for SQLITE_BUSY', () => {
    const sqliteError = { code: 'SQLITE_BUSY', message: 'database is locked' };
    expect(() => handleDatabaseError(sqliteError)).toThrow(DatabaseError);
    try {
      handleDatabaseError(sqliteError);
    } catch (e: any) {
      expect(e.statusCode).toBe(503);
      expect(e.code).toBe('DATABASE_BUSY');
    }
  });

  it('should re-throw DatabaseError instances', () => {
    const original = new NotFoundError('Product', 1);
    expect(() => handleDatabaseError(original)).toThrow(NotFoundError);
  });

  it('should throw NotFoundError for "No rows affected" with entity/id', () => {
    const error = { message: 'No rows affected' };
    expect(() => handleDatabaseError(error, 'Order', 5)).toThrow(NotFoundError);
  });

  it('should throw generic DatabaseError for unknown errors', () => {
    const error = { message: 'something unexpected' };
    expect(() => handleDatabaseError(error)).toThrow(DatabaseError);
  });
});

describe('errorHandler middleware', () => {
  it('should return proper JSON for DatabaseError', () => {
    const error = new NotFoundError('Product', 1);
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Product with ID 1 not found',
      },
    });
  });

  it('should return 500 for non-DatabaseError', () => {
    const error = new Error('Something broke');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
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

  it('should handle ValidationError with correct status code', () => {
    const error = new ValidationError('Bad input');
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
