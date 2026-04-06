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

describe('toSnakeCase', () => {
  it('should convert camelCase to snake_case', () => {
    expect(toSnakeCase('productId')).toBe('product_id');
    expect(toSnakeCase('contactPerson')).toBe('contact_person');
    expect(toSnakeCase('orderDetailDeliveryId')).toBe('order_detail_delivery_id');
  });

  it('should handle single word (no conversion needed)', () => {
    expect(toSnakeCase('name')).toBe('name');
    expect(toSnakeCase('email')).toBe('email');
  });

  it('should handle empty string', () => {
    expect(toSnakeCase('')).toBe('');
  });
});

describe('toCamelCase', () => {
  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('product_id')).toBe('productId');
    expect(toCamelCase('contact_person')).toBe('contactPerson');
    expect(toCamelCase('order_detail_delivery_id')).toBe('orderDetailDeliveryId');
  });

  it('should handle single word (no conversion needed)', () => {
    expect(toCamelCase('name')).toBe('name');
  });

  it('should handle empty string', () => {
    expect(toCamelCase('')).toBe('');
  });
});

describe('objectToSnakeCase', () => {
  it('should convert all keys to snake_case', () => {
    const input = { productId: 1, supplierName: 'Test', unitPrice: 9.99 };
    const result = objectToSnakeCase(input);
    expect(result).toEqual({ product_id: 1, supplier_name: 'Test', unit_price: 9.99 });
  });

  it('should handle empty object', () => {
    expect(objectToSnakeCase({})).toEqual({});
  });

  it('should preserve values', () => {
    const input = { isActive: true, count: 0, label: null };
    const result = objectToSnakeCase(input);
    expect(result).toEqual({ is_active: true, count: 0, label: null });
  });
});

describe('objectToCamelCase', () => {
  it('should convert all keys to camelCase', () => {
    const input = { product_id: 1, supplier_name: 'Test', unit_price: 9.99 };
    const result = objectToCamelCase(input);
    expect(result).toEqual({ productId: 1, supplierName: 'Test', unitPrice: 9.99 });
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
});

describe('buildInsertSQL', () => {
  it('should build correct INSERT SQL with snake_case columns', () => {
    const data = { name: 'Test', contactPerson: 'John', email: 'john@test.com' };
    const result = buildInsertSQL('suppliers', data);

    expect(result.sql).toBe(
      'INSERT INTO suppliers (name, contact_person, email) VALUES (?, ?, ?)',
    );
    expect(result.values).toEqual(['Test', 'John', 'john@test.com']);
  });

  it('should handle single field', () => {
    const data = { name: 'Test' };
    const result = buildInsertSQL('products', data);

    expect(result.sql).toBe('INSERT INTO products (name) VALUES (?)');
    expect(result.values).toEqual(['Test']);
  });
});

describe('buildUpdateSQL', () => {
  it('should build correct UPDATE SQL', () => {
    const data = { name: 'Updated', contactPerson: 'Jane' };
    const result = buildUpdateSQL('suppliers', data, 'supplier_id = ?');

    expect(result.sql).toBe(
      'UPDATE suppliers SET name = ?, contact_person = ? WHERE supplier_id = ?',
    );
    expect(result.values).toEqual(['Updated', 'Jane']);
  });

  it('should handle single field update', () => {
    const data = { name: 'Updated' };
    const result = buildUpdateSQL('products', data, 'product_id = ?');

    expect(result.sql).toBe('UPDATE products SET name = ? WHERE product_id = ?');
    expect(result.values).toEqual(['Updated']);
  });
});

describe('validateRequiredFields', () => {
  it('should not throw for valid object', () => {
    const obj = { name: 'Test', email: 'test@test.com' };
    expect(() => validateRequiredFields(obj, ['name', 'email'])).not.toThrow();
  });

  it('should throw for undefined field', () => {
    const obj = { name: 'Test' } as any;
    expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow(
      "Required field 'email' is missing or empty",
    );
  });

  it('should throw for null field', () => {
    const obj = { name: null };
    expect(() => validateRequiredFields(obj, ['name'])).toThrow(
      "Required field 'name' is missing or empty",
    );
  });

  it('should throw for empty string field', () => {
    const obj = { name: '' };
    expect(() => validateRequiredFields(obj, ['name'])).toThrow(
      "Required field 'name' is missing or empty",
    );
  });

  it('should not throw when no required fields', () => {
    expect(() => validateRequiredFields({}, [])).not.toThrow();
  });
});

describe('SelectQueryBuilder', () => {
  it('should build basic SELECT * query', () => {
    const builder = new SelectQueryBuilder('products');
    expect(builder.build()).toBe('SELECT * FROM products');
  });

  it('should build query with specific columns', () => {
    const builder = new SelectQueryBuilder('products');
    builder.select(['name', 'price']);
    expect(builder.build()).toBe('SELECT name, price FROM products');
  });

  it('should build query with JOIN', () => {
    const builder = new SelectQueryBuilder('products');
    builder.join('suppliers', 'products.supplier_id = suppliers.supplier_id');
    expect(builder.build()).toBe(
      'SELECT * FROM products INNER JOIN suppliers ON products.supplier_id = suppliers.supplier_id',
    );
  });

  it('should build query with LEFT JOIN', () => {
    const builder = new SelectQueryBuilder('orders');
    builder.join('branches', 'orders.branch_id = branches.branch_id', 'LEFT');
    expect(builder.build()).toBe(
      'SELECT * FROM orders LEFT JOIN branches ON orders.branch_id = branches.branch_id',
    );
  });

  it('should build query with WHERE clause', () => {
    const builder = new SelectQueryBuilder('products');
    builder.where('price > 10');
    expect(builder.build()).toBe('SELECT * FROM products WHERE price > 10');
  });

  it('should build query with multiple WHERE clauses (AND)', () => {
    const builder = new SelectQueryBuilder('products');
    builder.where('price > 10').where('supplier_id = 1');
    expect(builder.build()).toBe(
      'SELECT * FROM products WHERE price > 10 AND supplier_id = 1',
    );
  });

  it('should build query with ORDER BY', () => {
    const builder = new SelectQueryBuilder('products');
    builder.orderBy('name');
    expect(builder.build()).toBe('SELECT * FROM products ORDER BY name ASC');
  });

  it('should build query with ORDER BY DESC', () => {
    const builder = new SelectQueryBuilder('orders');
    builder.orderBy('order_date', 'DESC');
    expect(builder.build()).toBe('SELECT * FROM orders ORDER BY order_date DESC');
  });

  it('should build query with multiple ORDER BY', () => {
    const builder = new SelectQueryBuilder('products');
    builder.orderBy('name').orderBy('price', 'DESC');
    expect(builder.build()).toBe('SELECT * FROM products ORDER BY name ASC, price DESC');
  });

  it('should build query with LIMIT', () => {
    const builder = new SelectQueryBuilder('products');
    builder.limit(10);
    expect(builder.build()).toBe('SELECT * FROM products LIMIT 10');
  });

  it('should build query with OFFSET', () => {
    const builder = new SelectQueryBuilder('products');
    builder.limit(10).offset(20);
    expect(builder.build()).toBe('SELECT * FROM products LIMIT 10 OFFSET 20');
  });

  it('should build complex query with all clauses', () => {
    const builder = new SelectQueryBuilder('products');
    builder
      .select(['p.name', 'p.price', 's.name AS supplier_name'])
      .join('suppliers s', 'p.supplier_id = s.supplier_id')
      .where('p.price > 10')
      .where('s.name IS NOT NULL')
      .orderBy('p.name')
      .limit(50)
      .offset(0);
    expect(builder.build()).toBe(
      'SELECT p.name, p.price, s.name AS supplier_name FROM products INNER JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.price > 10 AND s.name IS NOT NULL ORDER BY p.name ASC LIMIT 50 OFFSET 0',
    );
  });

  it('should support chaining', () => {
    const builder = new SelectQueryBuilder('products');
    const result = builder.select(['name']).where('id = 1').orderBy('name').limit(1);
    expect(result).toBe(builder);
  });
});
