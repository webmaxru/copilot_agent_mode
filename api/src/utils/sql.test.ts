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
  it('should build simple SELECT query', () => {
    const builder = new SelectQueryBuilder('users');
    expect(builder.build()).toBe('SELECT * FROM users');
  });

  it('should build query with specific columns', () => {
    const builder = new SelectQueryBuilder('users');
    builder.select(['id', 'name', 'email']);
    expect(builder.build()).toBe('SELECT id, name, email FROM users');
  });

  it('should build query with INNER JOIN', () => {
    const builder = new SelectQueryBuilder('users');
    builder.join('profiles', 'users.id = profiles.user_id');
    expect(builder.build()).toBe('SELECT * FROM users INNER JOIN profiles ON users.id = profiles.user_id');
  });

  it('should build query with LEFT JOIN', () => {
    const builder = new SelectQueryBuilder('users');
    builder.join('profiles', 'users.id = profiles.user_id', 'LEFT');
    expect(builder.build()).toBe('SELECT * FROM users LEFT JOIN profiles ON users.id = profiles.user_id');
  });

  it('should build query with multiple JOINs', () => {
    const builder = new SelectQueryBuilder('users');
    builder.join('profiles', 'users.id = profiles.user_id');
    builder.join('roles', 'users.role_id = roles.id', 'LEFT');
    expect(builder.build()).toBe(
      'SELECT * FROM users INNER JOIN profiles ON users.id = profiles.user_id LEFT JOIN roles ON users.role_id = roles.id',
    );
  });

  it('should build query with WHERE clause', () => {
    const builder = new SelectQueryBuilder('users');
    builder.where('age >= 18');
    expect(builder.build()).toBe('SELECT * FROM users WHERE age >= 18');
  });

  it('should build query with multiple WHERE conditions', () => {
    const builder = new SelectQueryBuilder('users');
    builder.where('age >= 18');
    builder.where('status = ?');
    expect(builder.build()).toBe('SELECT * FROM users WHERE age >= 18 AND status = ?');
  });

  it('should build query with ORDER BY', () => {
    const builder = new SelectQueryBuilder('users');
    builder.orderBy('name');
    expect(builder.build()).toBe('SELECT * FROM users ORDER BY name ASC');
  });

  it('should build query with ORDER BY DESC', () => {
    const builder = new SelectQueryBuilder('users');
    builder.orderBy('created_at', 'DESC');
    expect(builder.build()).toBe('SELECT * FROM users ORDER BY created_at DESC');
  });

  it('should build query with multiple ORDER BY clauses', () => {
    const builder = new SelectQueryBuilder('users');
    builder.orderBy('last_name');
    builder.orderBy('first_name', 'DESC');
    expect(builder.build()).toBe('SELECT * FROM users ORDER BY last_name ASC, first_name DESC');
  });

  it('should build query with LIMIT', () => {
    const builder = new SelectQueryBuilder('users');
    builder.limit(10);
    expect(builder.build()).toBe('SELECT * FROM users LIMIT 10');
  });

  it('should build query with OFFSET', () => {
    const builder = new SelectQueryBuilder('users');
    builder.offset(20);
    expect(builder.build()).toBe('SELECT * FROM users OFFSET 20');
  });

  it('should build query with LIMIT and OFFSET', () => {
    const builder = new SelectQueryBuilder('users');
    builder.limit(10);
    builder.offset(20);
    expect(builder.build()).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
  });

  it('should build complex query with all features', () => {
    const builder = new SelectQueryBuilder('users');
    builder
      .select(['users.id', 'users.name', 'profiles.bio'])
      .join('profiles', 'users.id = profiles.user_id', 'LEFT')
      .where('users.age >= 18')
      .where('users.status = ?')
      .orderBy('users.name')
      .limit(10)
      .offset(20);

    expect(builder.build()).toBe(
      'SELECT users.id, users.name, profiles.bio FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE users.age >= 18 AND users.status = ? ORDER BY users.name ASC LIMIT 10 OFFSET 20',
    );
  });

  it('should support method chaining', () => {
    const query = new SelectQueryBuilder('users')
      .select(['id', 'name'])
      .where('active = 1')
      .orderBy('name')
      .limit(5)
      .build();

    expect(query).toBe('SELECT id, name FROM users WHERE active = 1 ORDER BY name ASC LIMIT 5');
  });
});

describe('Case Conversion Functions', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('userId')).toBe('user_id');
      expect(toSnakeCase('contactPerson')).toBe('contact_person');
    });

    it('should handle already lowercase strings', () => {
      expect(toSnakeCase('name')).toBe('name');
      expect(toSnakeCase('email')).toBe('email');
    });

    it('should handle multiple capital letters', () => {
      expect(toSnakeCase('XMLHttpRequest')).toBe('_x_m_l_http_request');
      expect(toSnakeCase('HTMLElement')).toBe('_h_t_m_l_element');
    });
  });

  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('first_name')).toBe('firstName');
      expect(toCamelCase('user_id')).toBe('userId');
      expect(toCamelCase('contact_person')).toBe('contactPerson');
    });

    it('should handle already camelCase strings', () => {
      expect(toCamelCase('name')).toBe('name');
      expect(toCamelCase('email')).toBe('email');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys to snake_case', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      };

      const result = objectToSnakeCase(input);

      expect(result).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      });
    });

    it('should handle empty object', () => {
      expect(objectToSnakeCase({})).toEqual({});
    });

    it('should preserve values', () => {
      const input = {
        count: 42,
        isActive: true,
        data: null,
      };

      const result = objectToSnakeCase(input);

      expect(result).toEqual({
        count: 42,
        is_active: true,
        data: null,
      });
    });
  });

  describe('objectToCamelCase', () => {
    it('should convert object keys to camelCase', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
      };

      const result = objectToCamelCase(input);

      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
      });
    });

    it('should handle empty object', () => {
      expect(objectToCamelCase({})).toEqual({});
    });

    it('should preserve values', () => {
      const input = {
        count: 42,
        is_active: true,
        data: null,
      };

      const result = objectToCamelCase(input);

      expect(result).toEqual({
        count: 42,
        isActive: true,
        data: null,
      });
    });
  });
});

describe('SQL Helper Functions', () => {
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
    it('should build INSERT statement with values', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      };

      const result = buildInsertSQL('users', data);

      expect(result.sql).toBe('INSERT INTO users (first_name, last_name, age) VALUES (?, ?, ?)');
      expect(result.values).toEqual(['John', 'Doe', 30]);
    });

    it('should handle single field', () => {
      const data = { name: 'Test' };
      const result = buildInsertSQL('items', data);

      expect(result.sql).toBe('INSERT INTO items (name) VALUES (?)');
      expect(result.values).toEqual(['Test']);
    });

    it('should handle empty object', () => {
      const data = {};
      const result = buildInsertSQL('empty', data);

      expect(result.sql).toBe('INSERT INTO empty () VALUES ()');
      expect(result.values).toEqual([]);
    });
  });

  describe('buildUpdateSQL', () => {
    it('should build UPDATE statement with values', () => {
      const data = {
        firstName: 'Jane',
        email: 'jane@example.com',
      };

      const result = buildUpdateSQL('users', data, 'id = ?');

      expect(result.sql).toBe('UPDATE users SET first_name = ?, email = ? WHERE id = ?');
      expect(result.values).toEqual(['Jane', 'jane@example.com']);
    });

    it('should handle single field update', () => {
      const data = { name: 'Updated' };
      const result = buildUpdateSQL('items', data, 'item_id = ?');

      expect(result.sql).toBe('UPDATE items SET name = ? WHERE item_id = ?');
      expect(result.values).toEqual(['Updated']);
    });

    it('should handle complex WHERE clause', () => {
      const data = { status: 'active' };
      const result = buildUpdateSQL('users', data, 'id = ? AND org_id = ?');

      expect(result.sql).toBe('UPDATE users SET status = ? WHERE id = ? AND org_id = ?');
      expect(result.values).toEqual(['active']);
    });
  });

  describe('validateRequiredFields', () => {
    it('should pass validation when all fields present', () => {
      const obj = {
        name: 'Test',
        email: 'test@example.com',
        age: 25,
      };

      expect(() => validateRequiredFields(obj, ['name', 'email', 'age'])).not.toThrow();
    });

    it('should throw error for undefined field', () => {
      const obj = {
        name: 'Test',
      };

      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'email' is missing or empty",
      );
    });

    it('should throw error for null field', () => {
      const obj = {
        name: 'Test',
        email: null,
      };

      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'email' is missing or empty",
      );
    });

    it('should throw error for empty string', () => {
      const obj = {
        name: '',
        email: 'test@example.com',
      };

      expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
        "Required field 'name' is missing or empty",
      );
    });

    it('should pass validation for zero value', () => {
      const obj = {
        count: 0,
        name: 'Test',
      };

      // 0 is a valid value, should not throw
      expect(() => validateRequiredFields(obj, ['count', 'name'])).not.toThrow();
    });

    it('should pass validation for boolean false', () => {
      const obj = {
        isActive: false,
        name: 'Test',
      };

      // false is a valid value, should not throw
      expect(() => validateRequiredFields(obj, ['isActive', 'name'])).not.toThrow();
    });

    it('should pass with empty required fields array', () => {
      const obj = { name: 'Test' };
      expect(() => validateRequiredFields(obj, [])).not.toThrow();
    });
  });
});
