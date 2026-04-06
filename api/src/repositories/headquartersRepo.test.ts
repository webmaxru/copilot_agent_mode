import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeadquartersRepository } from './headquartersRepo';
import { NotFoundError } from '../utils/errors';

vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

describe('HeadquartersRepository', () => {
  let repository: HeadquartersRepository;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    repository = new HeadquartersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all headquarters', async () => {
      const mockRows = [
        {
          headquarters_id: 1,
          name: 'Main HQ',
          description: 'Main headquarters',
          address: '123 Main St',
          contact_person: 'John',
          email: 'john@hq.com',
          phone: '555-1111',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM headquarters ORDER BY headquarters_id',
      );
      expect(result).toHaveLength(1);
      expect(result[0].headquartersId).toBe(1);
      expect(result[0].name).toBe('Main HQ');
    });

    it('should return empty array when no headquarters exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return headquarters when found', async () => {
      const mockRow = {
        headquarters_id: 1,
        name: 'Main HQ',
        description: 'Main headquarters',
        address: '123 Main St',
        contact_person: 'John',
        email: 'john@hq.com',
        phone: '555-1111',
      };
      mockDb.get.mockResolvedValue(mockRow);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT * FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
      expect(result?.headquartersId).toBe(1);
    });

    it('should return null when headquarters not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new headquarters and return it', async () => {
      const newHQ = {
        name: 'New HQ',
        description: 'A new headquarters',
        address: '456 New St',
        contactPerson: 'Jane',
        email: 'jane@hq.com',
        phone: '555-2222',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        headquarters_id: 2,
        name: 'New HQ',
        description: 'A new headquarters',
        address: '456 New St',
        contact_person: 'Jane',
        email: 'jane@hq.com',
        phone: '555-2222',
      });

      const result = await repository.create(newHQ);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.headquartersId).toBe(2);
      expect(result.name).toBe('New HQ');
    });
  });

  describe('update', () => {
    it('should update existing headquarters and return updated data', async () => {
      const updateData = { name: 'Updated HQ' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        headquarters_id: 1,
        name: 'Updated HQ',
        description: 'Main headquarters',
        address: '123 Main St',
        contact_person: 'John',
        email: 'john@hq.com',
        phone: '555-1111',
      });

      const result = await repository.update(1, updateData);

      expect(result.name).toBe('Updated HQ');
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing headquarters', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
    });

    it('should throw NotFoundError when headquarters does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when headquarters exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM headquarters WHERE headquarters_id = ?',
        [1],
      );
    });

    it('should return false when headquarters does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('findByName', () => {
    it('should return headquarters matching name pattern', async () => {
      const mockRows = [
        {
          headquarters_id: 1,
          name: 'Main HQ',
          description: 'Desc',
          address: '123 Main St',
          contact_person: 'John',
          email: 'john@hq.com',
          phone: '555-1111',
        },
      ];
      mockDb.all.mockResolvedValue(mockRows);

      const result = await repository.findByName('Main');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name',
        ['%Main%'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Main HQ');
    });

    it('should return empty array when no match', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findByName('NonExistent');

      expect(result).toEqual([]);
    });
  });
});
