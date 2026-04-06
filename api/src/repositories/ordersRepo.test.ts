import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersRepository } from './ordersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    repository = new OrdersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockRows = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2025-01-15',
          name: 'Order 1',
          description: 'First order',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

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
      const mockRow = {
        order_id: 1,
        branch_id: 1,
        order_date: '2025-01-15',
        name: 'Order 1',
        description: 'First order',
        status: 'pending',
      };
      mockDb.get.mockResolvedValue(mockRow);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM orders WHERE order_id = ?', [1]);
      expect(result?.orderId).toBe(1);
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
        orderDate: '2025-02-01',
        name: 'New Order',
        description: 'A new order',
        status: 'pending',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 2,
        branch_id: 1,
        order_date: '2025-02-01',
        name: 'New Order',
        description: 'A new order',
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
      const updateData = { status: 'shipped' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        order_id: 1,
        branch_id: 1,
        order_date: '2025-01-15',
        name: 'Order 1',
        description: 'First order',
        status: 'shipped',
      });

      const result = await repository.update(1, updateData);

      expect(result.status).toBe('shipped');
    });

    it('should throw NotFoundError when order does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { status: 'shipped' })).rejects.toThrow(NotFoundError);
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
    });

    it('should return false when order does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('findByBranchId', () => {
    it('should return orders for a branch', async () => {
      const mockRows = [
        {
          order_id: 1,
          branch_id: 3,
          order_date: '2025-01-15',
          name: 'Order 1',
          description: 'Desc',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findByBranchId(3);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC',
        [3],
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStatus', () => {
    it('should return orders matching status', async () => {
      const mockRows = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2025-01-15',
          name: 'Order 1',
          description: 'Desc',
          status: 'shipped',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findByStatus('shipped');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC',
        ['shipped'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('shipped');
    });
  });

  describe('findByDateRange', () => {
    it('should return orders within date range', async () => {
      const mockRows = [
        {
          order_id: 1,
          branch_id: 1,
          order_date: '2025-01-15',
          name: 'Order 1',
          description: 'Desc',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findByDateRange('2025-01-01', '2025-01-31');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
        ['2025-01-01', '2025-01-31'],
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no orders in range', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findByDateRange('2020-01-01', '2020-01-31');

      expect(result).toEqual([]);
    });
  });
});
