import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersRepository } from '../repositories/ordersRepo';
import { Order } from '../models/order';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let mockDb: any;

  const mockOrder: Order = {
    orderId: 1,
    branchId: 1,
    orderDate: '2024-01-15T10:00:00Z',
    name: 'Order #1',
    description: 'Test order',
    status: 'pending',
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

    repository = new OrdersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockResults = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2024-01-15T10:00:00Z',
          name: 'Order #1',
          description: 'Test',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM orders ORDER BY order_id');
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(1);
      expect(result[0].name).toBe('Order #1');
    });

    it('should return empty array when no orders exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return order when found', async () => {
      const mockResult = {
        order_id: 1,
        branch_id: 1,
        order_date: '2024-01-15T10:00:00Z',
        name: 'Order #1',
        description: 'Test',
        status: 'pending',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM orders WHERE order_id = ?', [1]);
      expect(result?.orderId).toBe(1);
      expect(result?.name).toBe('Order #1');
    });

    it('should return null when order not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order and return it', async () => {
      const newOrder = {
        branchId: 1,
        orderDate: '2024-01-16T11:00:00Z',
        name: 'New Order',
        description: 'New Description',
        status: 'pending',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 2,
        branch_id: 1,
        order_date: '2024-01-16T11:00:00Z',
        name: 'New Order',
        description: 'New Description',
        status: 'pending',
      });

      const result = await repository.create(newOrder);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.orderId).toBe(2);
      expect(result.name).toBe('New Order');
    });
  });

  describe('update', () => {
    it('should update existing order and return updated data', async () => {
      const updateData = { status: 'processing' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 1,
        branch_id: 1,
        order_date: '2024-01-15T10:00:00Z',
        name: 'Order #1',
        description: 'Test',
        status: 'processing',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.status).toBe('processing');
    });

    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { status: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing order', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM orders WHERE order_id = ?', [1]);
    });

    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when order exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM orders WHERE order_id = ?',
        [1],
      );
    });

    it('should return false when order does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });
});
