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
    orderDate: '2024-01-15',
    status: 'pending',
    notes: 'Test order',
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
          order_date: '2024-01-15',
          status: 'pending',
          notes: 'Test order',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM orders ORDER BY order_id');
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(1);
      expect(result[0].status).toBe('pending');
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
        order_date: '2024-01-15',
        status: 'pending',
        notes: 'Test order',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM orders WHERE order_id = ?', [1]);
      expect(result?.orderId).toBe(1);
      expect(result?.status).toBe('pending');
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
        orderDate: '2024-01-20',
        status: 'pending',
        notes: 'New order',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 2,
        branch_id: 1,
        order_date: '2024-01-20',
        status: 'pending',
        notes: 'New order',
      });

      const result = await repository.create(newOrder);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO orders (branch_id, order_date, status, notes) VALUES (?, ?, ?, ?)',
        [1, '2024-01-20', 'pending', 'New order'],
      );
      expect(result.orderId).toBe(2);
      expect(result.notes).toBe('New order');
    });
  });

  describe('update', () => {
    it('should update existing order and return updated data', async () => {
      const updateData = { status: 'completed' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 1,
        branch_id: 1,
        order_date: '2024-01-15',
        status: 'completed',
        notes: 'Test order',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['completed', 1],
      );
      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { status: 'completed' })).rejects.toThrow(
        NotFoundError,
      );
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

  describe('findByBranchId', () => {
    it('should return orders for a given branch', async () => {
      const mockResults = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2024-01-20',
          status: 'completed',
          notes: 'Order A',
        },
        {
          order_id: 2,
          branch_id: 1,
          order_date: '2024-01-15',
          status: 'pending',
          notes: 'Order B',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByBranchId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC',
        [1],
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('findByStatus', () => {
    it('should return orders with specific status', async () => {
      const mockResults = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2024-01-20',
          status: 'pending',
          notes: 'Order A',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByStatus('pending');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC',
        ['pending'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('findByDateRange', () => {
    it('should return orders within date range', async () => {
      const mockResults = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2024-01-15',
          status: 'pending',
          notes: 'Order A',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
        ['2024-01-01', '2024-01-31'],
      );
      expect(result).toHaveLength(1);
    });
  });
});
