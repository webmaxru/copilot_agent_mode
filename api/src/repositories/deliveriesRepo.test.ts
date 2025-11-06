import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveriesRepository } from '../repositories/deliveriesRepo';
import { Delivery } from '../models/delivery';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('DeliveriesRepository', () => {
  let repository: DeliveriesRepository;
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
    repository = new DeliveriesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      const mockResults = [
        {
          delivery_id: 1,
          supplier_id: 1,
          delivery_date: '2024-01-01',
          name: 'Delivery 1',
          description: 'Test delivery',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM deliveries ORDER BY delivery_id');
      expect(result).toHaveLength(1);
      expect(result[0].deliveryId).toBe(1);
    });

    it('should return empty array when no deliveries exist', async () => {
      mockDb.all.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return delivery when found', async () => {
      const mockResult = {
        delivery_id: 1,
        supplier_id: 1,
        delivery_date: '2024-01-01',
        name: 'Delivery 1',
        description: 'Test delivery',
        status: 'pending',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM deliveries WHERE delivery_id = ?', [1]);
      expect(result?.deliveryId).toBe(1);
    });

    it('should return null when delivery not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new delivery and return it', async () => {
      const newDelivery = {
        supplierId: 1,
        deliveryDate: '2024-01-01',
        name: 'New Delivery',
        description: 'New delivery description',
        status: 'pending',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        delivery_id: 2,
        supplier_id: 1,
        delivery_date: '2024-01-01',
        name: 'New Delivery',
        description: 'New delivery description',
        status: 'pending',
      });

      const result = await repository.create(newDelivery);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.deliveryId).toBe(2);
    });
  });

  describe('update', () => {
    it('should update existing delivery and return updated data', async () => {
      const updateData = { status: 'completed' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        delivery_id: 1,
        supplier_id: 1,
        delivery_date: '2024-01-01',
        name: 'Delivery 1',
        description: 'Test delivery',
        status: 'completed',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.status).toBe('completed');
    });

    it('should throw NotFoundError when delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { status: 'completed' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing delivery', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      await repository.delete(1);
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM deliveries WHERE delivery_id = ?', [1]);
    });

    it('should throw NotFoundError when delivery does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when delivery exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      const result = await repository.exists(1);
      expect(result).toBe(true);
    });

    it('should return false when delivery does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      const result = await repository.exists(999);
      expect(result).toBe(false);
    });
  });

  describe('findBySupplierId', () => {
    it('should return deliveries for given supplier', async () => {
      const mockResults = [
        {
          delivery_id: 1,
          supplier_id: 1,
          delivery_date: '2024-01-01',
          name: 'Delivery 1',
          description: 'Test',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findBySupplierId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM deliveries WHERE supplier_id = ? ORDER BY delivery_date DESC',
        [1],
      );
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe(1);
    });
  });

  describe('findByStatus', () => {
    it('should return deliveries with given status', async () => {
      const mockResults = [
        {
          delivery_id: 1,
          supplier_id: 1,
          delivery_date: '2024-01-01',
          name: 'Delivery 1',
          description: 'Test',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByStatus('pending');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM deliveries WHERE status = ? ORDER BY delivery_date DESC',
        ['pending'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('findByDateRange', () => {
    it('should return deliveries within date range', async () => {
      const mockResults = [
        {
          delivery_id: 1,
          supplier_id: 1,
          delivery_date: '2024-01-15',
          name: 'Delivery 1',
          description: 'Test',
          status: 'completed',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM deliveries WHERE delivery_date >= ? AND delivery_date <= ? ORDER BY delivery_date DESC',
        ['2024-01-01', '2024-01-31'],
      );
      expect(result).toHaveLength(1);
    });
  });
});
