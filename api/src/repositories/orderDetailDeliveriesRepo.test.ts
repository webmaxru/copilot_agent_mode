import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderDetailDeliveriesRepository } from '../repositories/orderDetailDeliveriesRepo';
import { OrderDetailDelivery } from '../models/orderDetailDelivery';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('OrderDetailDeliveriesRepository', () => {
  let repository: OrderDetailDeliveriesRepository;
  let mockDb: any;

  const mockOrderDetailDelivery: OrderDetailDelivery = {
    orderDetailDeliveryId: 1,
    orderDetailId: 1,
    deliveryId: 1,
    quantity: 5,
    notes: 'Test notes',
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

    repository = new OrderDetailDeliveriesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all order detail deliveries', async () => {
      const mockResults = [
        {
          order_detail_delivery_id: 1,
          order_detail_id: 1,
          delivery_id: 1,
          quantity: 5,
          notes: 'Test',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM order_detail_deliveries ORDER BY order_detail_delivery_id',
      );
      expect(result).toHaveLength(1);
      expect(result[0].orderDetailDeliveryId).toBe(1);
      expect(result[0].quantity).toBe(5);
    });

    it('should return empty array when no order detail deliveries exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return order detail delivery when found', async () => {
      const mockResult = {
        order_detail_delivery_id: 1,
        order_detail_id: 1,
        delivery_id: 1,
        quantity: 5,
        notes: 'Test',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM order_detail_deliveries WHERE order_detail_delivery_id = ?',
        [1],
      );
      expect(result?.orderDetailDeliveryId).toBe(1);
      expect(result?.quantity).toBe(5);
    });

    it('should return null when order detail delivery not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order detail delivery and return it', async () => {
      const newOrderDetailDelivery = {
        orderDetailId: 1,
        deliveryId: 1,
        quantity: 3,
        notes: 'New notes',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        order_detail_delivery_id: 2,
        order_detail_id: 1,
        delivery_id: 1,
        quantity: 3,
        notes: 'New notes',
      });

      const result = await repository.create(newOrderDetailDelivery);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.orderDetailDeliveryId).toBe(2);
      expect(result.quantity).toBe(3);
    });
  });

  describe('update', () => {
    it('should update existing order detail delivery and return updated data', async () => {
      const updateData = { quantity: 7 };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        order_detail_delivery_id: 1,
        order_detail_id: 1,
        delivery_id: 1,
        quantity: 7,
        notes: 'Test',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.quantity).toBe(7);
    });

    it('should throw NotFoundError when order detail delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { quantity: 5 })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing order detail delivery', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM order_detail_deliveries WHERE order_detail_delivery_id = ?',
        [1],
      );
    });

    it('should throw NotFoundError when order detail delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when order detail delivery exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM order_detail_deliveries WHERE order_detail_delivery_id = ?',
        [1],
      );
    });

    it('should return false when order detail delivery does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });
});
