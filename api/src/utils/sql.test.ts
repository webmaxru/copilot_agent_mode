import { describe, it, expect } from 'vitest';
import {
  toSnakeCase,
  toCamelCase,
  objectToSnakeCase,
  objectToCamelCase,
  generatePlaceholders,
  buildInsertSQL,
  buildUpdateSQL,
  validateRequiredFields,
  SelectQueryBuilder,
} from './sql';

describe('SQL Utilities', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('userId')).toBe('user_id');
      expect(toSnakeCase('productName')).toBe('product_name');
      expect(toSnakeCase('orderDetailId')).toBe('order_detail_id');
    });

    it('should handle already snake_case strings', () => {
      expect(toSnakeCase('user_id')).toBe('user_id');
    });

    it('should handle single words', () => {
      expect(toSnakeCase('name')).toBe('name');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('user_id')).toBe('userId');
      expect(toCamelCase('product_name')).toBe('productName');
      expect(toCamelCase('order_detail_id')).toBe('orderDetailId');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('userId')).toBe('userId');
    });

    it('should handle single words', () => {
      expect(toCamelCase('name')).toBe('name');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        userId: 1,
        productName: 'Test Product',
        orderDetailId: 5,
      };
      const expected = {
        user_id: 1,
        product_name: 'Test Product',
        order_detail_id: 5,
      };
      expect(objectToSnakeCase(input)).toEqual(expected);
    });

    it('should handle empty object', () => {
      expect(objectToSnakeCase({})).toEqual({});
    });
  });

  describe('objectToCamelCase', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = {
        user_id: 1,
        product_name: 'Test Product',
        order_detail_id: 5,
      };
      const expected = {
        userId: 1,
        productName: 'Test Product',
        orderDetailId: 5,
      };
      expect(objectToCamelCase(input)).toEqual(expected);
    });

    it('should handle empty object', () => {
      expect(objectToCamelCase({})).toEqual({});
    });
  });

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
    it('should build correct INSERT SQL', () => {
      const data = {
        userId: 1,
        userName: 'John',
        userEmail: 'john@example.com',
      };
      const { sql, values } = buildInsertSQL('users', data);

      expect(sql).toBe('INSERT INTO users (user_id, user_name, user_email) VALUES (?, ?, ?)');
      expect(values).toEqual([1, 'John', 'john@example.com']);
    });

    it('should handle single field', () => {
      const data = { name: 'Test' };
      const { sql, values } = buildInsertSQL('test_table', data);

      expect(sql).toBe('INSERT INTO test_table (name) VALUES (?)');
      expect(values).toEqual(['Test']);
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build correct UPDATE SQL', () => {
      const data = {
        userName: 'Jane',
        userEmail: 'jane@example.com',
      };
      const { sql, values } = buildUpdateSQL('users', data, 'user_id = ?');

      expect(sql).toBe('UPDATE users SET user_name = ?, user_email = ? WHERE user_id = ?');
      expect(values).toEqual(['Jane', 'jane@example.com']);
    });

    it('should handle single field update', () => {
      const data = { name: 'Updated' };
      const { sql, values } = buildUpdateSQL('test_table', data, 'id = ?');

      expect(sql).toBe('UPDATE test_table SET name = ? WHERE id = ?');
      expect(values).toEqual(['Updated']);
    });
  });

  describe('validateRequiredFields', () => {
    it('should not throw for valid object', () => {
      const obj = { name: 'Test', email: 'test@test.com' };
      expect(() => validateRequiredFields(obj, ['name', 'email'])).not.toThrow();
    });

    it('should throw for missing field', () => {
      const obj = { name: 'Test' };
      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'email' is missing or empty",
      );
    });

    it('should throw for null field', () => {
      const obj = { name: 'Test', email: null };
      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'email' is missing or empty",
      );
    });

    it('should throw for empty string field', () => {
      const obj = { name: 'Test', email: '' };
      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'email' is missing or empty",
      );
    });
  });

  describe('SelectQueryBuilder', () => {
    it('should build basic SELECT query', () => {
      const query = new SelectQueryBuilder('users').build();
      expect(query).toBe('SELECT * FROM users');
    });

    it('should build SELECT with specific columns', () => {
      const query = new SelectQueryBuilder('users').select(['id', 'name', 'email']).build();
      expect(query).toBe('SELECT id, name, email FROM users');
    });

    it('should build SELECT with WHERE clause', () => {
      const query = new SelectQueryBuilder('users').where('id = 1').build();
      expect(query).toBe('SELECT * FROM users WHERE id = 1');
    });

    it('should build SELECT with multiple WHERE clauses', () => {
      const query = new SelectQueryBuilder('users').where('id > 0').where('active = 1').build();
      expect(query).toBe('SELECT * FROM users WHERE id > 0 AND active = 1');
    });

    it('should build SELECT with ORDER BY', () => {
      const query = new SelectQueryBuilder('users').orderBy('name', 'ASC').build();
      expect(query).toBe('SELECT * FROM users ORDER BY name ASC');
    });

    it('should build SELECT with multiple ORDER BY', () => {
      const query = new SelectQueryBuilder('users')
        .orderBy('name', 'ASC')
        .orderBy('id', 'DESC')
        .build();
      expect(query).toBe('SELECT * FROM users ORDER BY name ASC, id DESC');
    });

    it('should build SELECT with LIMIT', () => {
      const query = new SelectQueryBuilder('users').limit(10).build();
      expect(query).toBe('SELECT * FROM users LIMIT 10');
    });

    it('should build SELECT with OFFSET', () => {
      const query = new SelectQueryBuilder('users').limit(10).offset(20).build();
      expect(query).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
    });

    it('should build SELECT with JOIN', () => {
      const query = new SelectQueryBuilder('users')
        .join('orders', 'users.id = orders.user_id', 'INNER')
        .build();
      expect(query).toBe('SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id');
    });

    it('should build complex SELECT query', () => {
      const query = new SelectQueryBuilder('users')
        .select(['users.id', 'users.name', 'orders.total'])
        .join('orders', 'users.id = orders.user_id', 'LEFT')
        .where('users.active = 1')
        .where('orders.total > 100')
        .orderBy('orders.total', 'DESC')
        .limit(5)
        .offset(10)
        .build();

      expect(query).toBe(
        'SELECT users.id, users.name, orders.total FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE users.active = 1 AND orders.total > 100 ORDER BY orders.total DESC LIMIT 5 OFFSET 10',
      );
    });
  });
});
