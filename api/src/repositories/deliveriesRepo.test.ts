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

  const mockDelivery: Delivery = {
    deliveryId: 1,
    supplierId: 1,
    deliveryDate: '2024-01-20T09:00:00Z',
    name: 'Delivery #1',
    description: 'Test delivery',
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

    repository = new DeliveriesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all deliveries', async () => {
      const mockResults = [
        {
          delivery_id: 1,
          supplier_id: 1,
          delivery_date: '2024-01-20T09:00:00Z',
          name: 'Delivery #1',
          description: 'Test',
          status: 'pending',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM deliveries ORDER BY delivery_id');
      expect(result).toHaveLength(1);
      expect(result[0].deliveryId).toBe(1);
      expect(result[0].name).toBe('Delivery #1');
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
        delivery_date: '2024-01-20T09:00:00Z',
        name: 'Delivery #1',
        description: 'Test',
        status: 'pending',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM deliveries WHERE delivery_id = ?', [1]);
      expect(result?.deliveryId).toBe(1);
      expect(result?.name).toBe('Delivery #1');
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
        deliveryDate: '2024-01-21T10:00:00Z',
        name: 'New Delivery',
        description: 'New Description',
        status: 'pending',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        delivery_id: 2,
        supplier_id: 1,
        delivery_date: '2024-01-21T10:00:00Z',
        name: 'New Delivery',
        description: 'New Description',
        status: 'pending',
      });

      const result = await repository.create(newDelivery);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.deliveryId).toBe(2);
      expect(result.name).toBe('New Delivery');
    });
  });

  describe('update', () => {
    it('should update existing delivery and return updated data', async () => {
      const updateData = { status: 'completed' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        delivery_id: 1,
        supplier_id: 1,
        delivery_date: '2024-01-20T09:00:00Z',
        name: 'Delivery #1',
        description: 'Test',
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

  describe('updateStatus', () => {
    it('should update delivery status', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        delivery_id: 1,
        supplier_id: 1,
        delivery_date: '2024-01-20T09:00:00Z',
        name: 'Delivery #1',
        description: 'Test',
        status: 'in_transit',
      });

      const result = await repository.updateStatus(1, 'in_transit');

      expect(result.status).toBe('in_transit');
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
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM deliveries WHERE delivery_id = ?',
        [1],
      );
    });

    it('should return false when delivery does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });
});
