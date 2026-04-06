import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from './productsRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    repository = new ProductsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockRows = [
        {
          product_id: 1,
          supplier_id: 1,
          name: 'Smart Feeder',
          description: 'AI-powered cat feeder',
          price: 49.99,
          sku: 'SF-001',
          unit: 'piece',
          img_name: 'feeder.png',
          discount: 0,
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM products ORDER BY product_id');
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
      expect(result[0].name).toBe('Smart Feeder');
      expect(result[0].price).toBe(49.99);
    });

    it('should return empty array when no products exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return product when found', async () => {
      const mockRow = {
        product_id: 1,
        supplier_id: 1,
        name: 'Smart Feeder',
        description: 'AI feeder',
        price: 49.99,
        sku: 'SF-001',
        unit: 'piece',
        img_name: 'feeder.png',
        discount: 0,
      };
      mockDb.get.mockResolvedValue(mockRow);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM products WHERE product_id = ?', [1]);
      expect(result?.productId).toBe(1);
      expect(result?.name).toBe('Smart Feeder');
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
        description: 'A new product',
        price: 29.99,
        sku: 'NP-001',
        unit: 'piece',
        imgName: 'new.png',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        product_id: 2,
        supplier_id: 1,
        name: 'New Product',
        description: 'A new product',
        price: 29.99,
        sku: 'NP-001',
        unit: 'piece',
        img_name: 'new.png',
        discount: 0,
      });

      const result = await repository.create(newProduct);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.productId).toBe(2);
      expect(result.name).toBe('New Product');
    });
  });

  describe('update', () => {
    it('should update existing product and return updated data', async () => {
      const updateData = { name: 'Updated Product', price: 39.99 };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        product_id: 1,
        supplier_id: 1,
        name: 'Updated Product',
        description: 'Test',
        price: 39.99,
        sku: 'SF-001',
        unit: 'piece',
        img_name: 'feeder.png',
        discount: 0,
      });

      const result = await repository.update(1, updateData);

      expect(result.name).toBe('Updated Product');
      expect(result.price).toBe(39.99);
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
    it('should return products for a supplier', async () => {
      const mockRows = [
        {
          product_id: 1,
          supplier_id: 5,
          name: 'Product A',
          description: 'Desc',
          price: 10,
          sku: 'A1',
          unit: 'piece',
          img_name: 'a.png',
          discount: 0,
        },
        {
          product_id: 2,
          supplier_id: 5,
          name: 'Product B',
          description: 'Desc',
          price: 20,
          sku: 'B1',
          unit: 'piece',
          img_name: 'b.png',
          discount: 0,
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findBySupplierId(5);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE supplier_id = ? ORDER BY name',
        [5],
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no products for supplier', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findBySupplierId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('should return products matching name pattern', async () => {
      const mockRows = [
        {
          product_id: 1,
          supplier_id: 1,
          name: 'Smart Feeder',
          description: 'Test',
          price: 49.99,
          sku: 'SF-001',
          unit: 'piece',
          img_name: 'feeder.png',
          discount: 0,
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findByName('Smart');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Smart Feeder');
    });
  });
});
