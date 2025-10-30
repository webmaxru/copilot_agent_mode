import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from '../repositories/productsRepo';
import { Product } from '../models/product';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockDb: any;

  const mockProduct: Product = {
    productId: 1,
    supplierId: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    sku: 'TEST-001',
    unit: 'piece',
    imgName: 'test.jpg',
    discount: 0.1,
  };

  beforeEach(() => {
    // Create mock database connection
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    // Mock getDatabase to return our mock
    (getDatabase as any).mockResolvedValue(mockDb);

    repository = new ProductsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockResults = [
        {
          product_id: 1,
          supplier_id: 1,
          name: 'Test Product',
          description: 'Test',
          price: 29.99,
          sku: 'TEST-001',
          unit: 'piece',
          img_name: 'test.jpg',
          discount: 0.1,
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM products ORDER BY product_id');
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
      expect(result[0].name).toBe('Test Product');
    });

    it('should return empty array when no products exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      const mockResult = {
        product_id: 1,
        supplier_id: 1,
        name: 'Test Product',
        description: 'Test',
        price: 29.99,
        sku: 'TEST-001',
        unit: 'piece',
        img_name: 'test.jpg',
        discount: 0.1,
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM products WHERE product_id = ?', [1]);
      expect(result?.productId).toBe(1);
      expect(result?.name).toBe('Test Product');
    });

    it('should return null when product not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new product and return it', async () => {
      const newProduct = {
        supplierId: 1,
        name: 'New Product',
        description: 'New Description',
        price: 39.99,
        sku: 'NEW-001',
        unit: 'box',
        imgName: 'new.jpg',
        discount: 0.15,
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        product_id: 2,
        supplier_id: 1,
        name: 'New Product',
        description: 'New Description',
        price: 39.99,
        sku: 'NEW-001',
        unit: 'box',
        img_name: 'new.jpg',
        discount: 0.15,
      });

      const result = await repository.create(newProduct);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.productId).toBe(2);
      expect(result.name).toBe('New Product');
    });
  });

  describe('update', () => {
    it('should update existing product and return updated data', async () => {
      const updateData = { name: 'Updated Product' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        product_id: 1,
        supplier_id: 1,
        name: 'Updated Product',
        description: 'Test',
        price: 29.99,
        sku: 'TEST-001',
        unit: 'piece',
        img_name: 'test.jpg',
        discount: 0.1,
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.name).toBe('Updated Product');
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing product', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM products WHERE product_id = ?', [1]);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when product exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM products WHERE product_id = ?',
        [1],
      );
    });

    it('should return false when product does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('findBySupplierId', () => {
    it('should return products for supplier', async () => {
      const mockResults = [
        {
          product_id: 1,
          supplier_id: 1,
          name: 'Product 1',
          description: 'Test',
          price: 29.99,
          sku: 'TEST-001',
          unit: 'piece',
          img_name: 'test.jpg',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findBySupplierId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE supplier_id = ? ORDER BY name',
        [1],
      );
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe(1);
    });
  });
});
