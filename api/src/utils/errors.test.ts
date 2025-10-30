import { describe, it, expect } from 'vitest';
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
  ConflictError,
  handleDatabaseError,
  errorHandler,
} from './errors';

describe('Error Utilities', () => {
  describe('DatabaseError', () => {
    it('should create database error with default values', () => {
      const error = new DatabaseError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create database error with custom values', () => {
      const error = new DatabaseError('Custom error', 'CUSTOM_CODE', 400);
      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with string ID', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe('User with ID 123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create not found error with number ID', () => {
      const error = new NotFoundError('Product', 456);
      expect(error.message).toBe('Product with ID 456 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
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

  describe('handleDatabaseError', () => {
    it('should throw ConflictError for UNIQUE constraint violation', () => {
      const sqliteError = {
        code: 'SQLITE_CONSTRAINT',
        message: 'UNIQUE constraint failed',
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

    it('should throw DatabaseError with 503 for SQLITE_BUSY', () => {
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
        return;
      }
      throw new Error('Expected handleDatabaseError to throw an error');
    });

    it('should rethrow DatabaseError instances', () => {
      const dbError = new NotFoundError('User', 123);

      expect(() => handleDatabaseError(dbError)).toThrow(NotFoundError);
    });

    it('should throw NotFoundError for "No rows affected" message', () => {
      const error = {
        message: 'No rows affected',
      };

      expect(() => handleDatabaseError(error, 'Product', 123)).toThrow(NotFoundError);
      expect(() => handleDatabaseError(error, 'Product', 123)).toThrow(
        'Product with ID 123 not found',
      );
    });

    it('should throw generic DatabaseError for unknown errors', () => {
      const unknownError = {
        message: 'Some unknown error',
      };

      try {
        handleDatabaseError(unknownError);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.statusCode).toBe(500);
        expect(error.message).toContain('Some unknown error');
        return;
      }
      throw new Error('Expected handleDatabaseError to throw an error');
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle DatabaseError', () => {
      const error = new NotFoundError('User', 123);
      const req = {};
      const res = {
        status: function (code: number) {
          this.statusCode = code;
          return this;
        },
        json: function (body: any) {
          this.body = body;
          return this;
        },
        statusCode: 0,
        body: {},
      };
      const next = () => {};

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
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
        status: function (code: number) {
          this.statusCode = code;
          return this;
        },
        json: function (body: any) {
          this.body = body;
          return this;
        },
        statusCode: 0,
        body: {},
      };
      const next = () => {};

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation error: Invalid input',
        },
      });
    });

    it('should handle unknown errors with 500 status', () => {
      const error = new Error('Unknown error');
      const req = {};
      const res = {
        status: function (code: number) {
          this.statusCode = code;
          return this;
        },
        json: function (body: any) {
          this.body = body;
          return this;
        },
        statusCode: 0,
        body: {},
      };
      const next = () => {};

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });
  });
});
