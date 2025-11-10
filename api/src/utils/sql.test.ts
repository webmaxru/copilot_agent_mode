import { describe, it, expect } from 'vitest';
import {
  SelectQueryBuilder,
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
  generatePlaceholders,
  buildInsertSQL,
  buildUpdateSQL,
  validateRequiredFields,
} from './sql';

describe('SelectQueryBuilder', () => {
  it('should build basic SELECT query', () => {
    const query = new SelectQueryBuilder('users').build();
    expect(query).toBe('SELECT * FROM users');
  });

  it('should build query with specific columns', () => {
    const query = new SelectQueryBuilder('users').select(['id', 'name']).build();
    expect(query).toBe('SELECT id, name FROM users');
  });

  it('should build query with WHERE clause', () => {
    const query = new SelectQueryBuilder('users').where('id = 1').build();
    expect(query).toBe('SELECT * FROM users WHERE id = 1');
  });

  it('should build query with multiple WHERE clauses', () => {
    const query = new SelectQueryBuilder('users').where('id = 1').where('active = true').build();
    expect(query).toBe('SELECT * FROM users WHERE id = 1 AND active = true');
  });

  it('should build query with JOIN', () => {
    const query = new SelectQueryBuilder('users')
      .join('orders', 'users.id = orders.user_id')
      .build();
    expect(query).toBe('SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id');
  });

  it('should build query with LEFT JOIN', () => {
    const query = new SelectQueryBuilder('users')
      .join('orders', 'users.id = orders.user_id', 'LEFT')
      .build();
    expect(query).toBe('SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id');
  });

  it('should build query with ORDER BY', () => {
    const query = new SelectQueryBuilder('users').orderBy('name').build();
    expect(query).toBe('SELECT * FROM users ORDER BY name ASC');
  });

  it('should build query with ORDER BY DESC', () => {
    const query = new SelectQueryBuilder('users').orderBy('created_at', 'DESC').build();
    expect(query).toBe('SELECT * FROM users ORDER BY created_at DESC');
  });

  it('should build query with LIMIT', () => {
    const query = new SelectQueryBuilder('users').limit(10).build();
    expect(query).toBe('SELECT * FROM users LIMIT 10');
  });

  it('should build query with OFFSET', () => {
    const query = new SelectQueryBuilder('users').limit(10).offset(20).build();
    expect(query).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
  });

  it('should build complex query', () => {
    const query = new SelectQueryBuilder('users')
      .select(['id', 'name', 'email'])
      .join('orders', 'users.id = orders.user_id', 'LEFT')
      .where('users.active = true')
      .where('orders.total > 100')
      .orderBy('users.created_at', 'DESC')
      .limit(10)
      .offset(0)
      .build();

    expect(query).toBe(
      'SELECT id, name, email FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE users.active = true AND orders.total > 100 ORDER BY users.created_at DESC LIMIT 10 OFFSET 0',
    );
  });
});

describe('Case conversion functions', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userId')).toBe('user_id');
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('createdAt')).toBe('created_at');
    });

    it('should handle already lowercase strings', () => {
      expect(toSnakeCase('user')).toBe('user');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('user_id')).toBe('userId');
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('created_at')).toBe('createdAt');
    });

    it('should handle strings without underscores', () => {
      expect(toCamelCase('user')).toBe('user');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        userId: 1,
        firstName: 'John',
        createdAt: '2024-01-01',
      };

      const result = objectToSnakeCase(input);

      expect(result).toEqual({
        user_id: 1,
        first_name: 'John',
        created_at: '2024-01-01',
      });
    });
  });

  describe('objectToCamelCase', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = {
        user_id: 1,
        first_name: 'John',
        created_at: '2024-01-01',
      };

      const result = objectToCamelCase(input);

      expect(result).toEqual({
        userId: 1,
        firstName: 'John',
        createdAt: '2024-01-01',
      });
    });
  });
});

describe('SQL generation functions', () => {
  describe('generatePlaceholders', () => {
    it('should generate correct number of placeholders', () => {
      expect(generatePlaceholders(1)).toBe('?');
      expect(generatePlaceholders(3)).toBe('?, ?, ?');
      expect(generatePlaceholders(5)).toBe('?, ?, ?, ?, ?');
    });

    it('should handle zero placeholders', () => {
      expect(generatePlaceholders(0)).toBe('');
    });
  });

  describe('buildInsertSQL', () => {
    it('should build INSERT SQL with correct placeholders', () => {
      const data = {
        userId: 1,
        firstName: 'John',
        email: 'john@example.com',
      };

      const result = buildInsertSQL('users', data);

      expect(result.sql).toBe(
        'INSERT INTO users (user_id, first_name, email) VALUES (?, ?, ?)',
      );
      expect(result.values).toEqual([1, 'John', 'john@example.com']);
    });

    it('should handle single column insert', () => {
      const data = { name: 'Test' };
      const result = buildInsertSQL('categories', data);

      expect(result.sql).toBe('INSERT INTO categories (name) VALUES (?)');
      expect(result.values).toEqual(['Test']);
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build UPDATE SQL with correct placeholders', () => {
      const data = {
        firstName: 'Jane',
        email: 'jane@example.com',
      };

      const result = buildUpdateSQL('users', data, 'user_id = ?');

      expect(result.sql).toBe('UPDATE users SET first_name = ?, email = ? WHERE user_id = ?');
      expect(result.values).toEqual(['Jane', 'jane@example.com']);
    });

    it('should handle single column update', () => {
      const data = { status: 'completed' };
      const result = buildUpdateSQL('orders', data, 'order_id = ?');

      expect(result.sql).toBe('UPDATE orders SET status = ? WHERE order_id = ?');
      expect(result.values).toEqual(['completed']);
    });
  });
});

describe('validateRequiredFields', () => {
  it('should not throw for valid object', () => {
    const obj = {
      name: 'Test',
      email: 'test@example.com',
      age: 25,
    };

    expect(() => validateRequiredFields(obj, ['name', 'email'])).not.toThrow();
  });

  it('should throw for undefined field', () => {
    const obj = {
      name: 'Test',
    };

    expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
      "Required field 'email' is missing or empty",
    );
  });

  it('should throw for null field', () => {
    const obj = {
      name: 'Test',
      email: null,
    };

    expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
      "Required field 'email' is missing or empty",
    );
  });

  it('should throw for empty string', () => {
    const obj = {
      name: '',
      email: 'test@example.com',
    };

    expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
      "Required field 'name' is missing or empty",
    );
  });

  it('should allow zero as valid value', () => {
    const obj = {
      name: 'Test',
      count: 0,
    };

    expect(() => validateRequiredFields(obj, ['name', 'count'])).not.toThrow();
  });
});
