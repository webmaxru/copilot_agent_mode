import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { OrderDetail } from '../models/orderDetail';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('OrderDetailsRepository', () => {
  let repository: OrderDetailsRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    (getDatabase as any).mockResolvedValue(mockDb);
    repository = new OrderDetailsRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all order details', async () => {
      const mockResults = [
        {
          order_detail_id: 1,
          order_id: 1,
          product_id: 1,
          quantity: 10,
          unit_price: 99.99,
          notes: 'Test note',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM order_details ORDER BY order_detail_id');
      expect(result).toHaveLength(1);
      expect(result[0].orderDetailId).toBe(1);
    });

    it('should return empty array when no order details exist', async () => {
      mockDb.all.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return order detail when found', async () => {
      const mockResult = {
        order_detail_id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 10,
        unit_price: 99.99,
        notes: 'Test note',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM order_details WHERE order_detail_id = ?',
        [1],
      );
      expect(result?.orderDetailId).toBe(1);
    });

    it('should return null when order detail not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order detail and return it', async () => {
      const newOrderDetail = {
        orderId: 1,
        productId: 1,
        quantity: 5,
        unitPrice: 49.99,
        notes: 'New note',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        order_detail_id: 2,
        order_id: 1,
        product_id: 1,
        quantity: 5,
        unit_price: 49.99,
        notes: 'New note',
      });

      const result = await repository.create(newOrderDetail);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.orderDetailId).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing order detail and return updated data', async () => {
      const updateData = { quantity: 15 };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        order_detail_id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 15,
        unit_price: 99.99,
        notes: 'Test note',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.quantity).toBe(15);
    });

    it('should throw NotFoundError when order detail does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { quantity: 10 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing order detail', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      await repository.delete(1);
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM order_details WHERE order_detail_id = ?',
        [1],
      );
    });

    it('should throw NotFoundError when order detail does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when order detail exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      const result = await repository.exists(1);
      expect(result).toBe(true);
    });

    it('should return false when order detail does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      const result = await repository.exists(999);
      expect(result).toBe(false);
    });
  });

  describe('findByOrderId', () => {
    it('should return order details for given order', async () => {
      const mockResults = [
        {
          order_detail_id: 1,
          order_id: 1,
          product_id: 1,
          quantity: 10,
          unit_price: 99.99,
          notes: 'Test',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByOrderId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM order_details WHERE order_id = ? ORDER BY order_detail_id',
        [1],
      );
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(1);
    });
  });

  describe('findByProductId', () => {
    it('should return order details for given product', async () => {
      const mockResults = [
        {
          order_detail_id: 1,
          order_id: 1,
          product_id: 1,
          quantity: 10,
          unit_price: 99.99,
          notes: 'Test',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByProductId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM order_details WHERE product_id = ? ORDER BY order_detail_id',
        [1],
      );
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
    });
  });
});
