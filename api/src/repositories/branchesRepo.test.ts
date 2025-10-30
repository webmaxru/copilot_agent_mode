import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BranchesRepository } from '../repositories/branchesRepo';
import { Branch } from '../models/branch';
import { NotFoundError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

// Import the mocked module
import { getDatabase } from '../db/sqlite';

describe('BranchesRepository', () => {
  let repository: BranchesRepository;
  let mockDb: any;

  const mockBranch: Branch = {
    branchId: 1,
    headquartersId: 1,
    name: 'Main Branch',
    description: 'Test Description',
    address: '123 Branch St',
    contactPerson: 'John Doe',
    email: 'john@test.com',
    phone: '555-1234',
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

    repository = new BranchesRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all branches', async () => {
      const mockResults = [
        {
          branch_id: 1,
          headquarters_id: 1,
          name: 'Main Branch',
          description: 'Test',
          address: '123 Branch St',
          contact_person: 'John',
          email: 'john@test.com',
          phone: '555-1234',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM branches ORDER BY branch_id');
      expect(result).toHaveLength(1);
      expect(result[0].branchId).toBe(1);
      expect(result[0].name).toBe('Main Branch');
    });

    it('should return empty array when no branches exist', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return branch when found', async () => {
      const mockResult = {
        branch_id: 1,
        headquarters_id: 1,
        name: 'Main Branch',
        description: 'Test',
        address: '123 Branch St',
        contact_person: 'John',
        email: 'john@test.com',
        phone: '555-1234',
      };
      mockDb.get.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM branches WHERE branch_id = ?', [1]);
      expect(result?.branchId).toBe(1);
      expect(result?.name).toBe('Main Branch');
    });

    it('should return null when branch not found', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new branch and return it', async () => {
      const newBranch = {
        headquartersId: 1,
        name: 'New Branch',
        description: 'New Description',
        address: '456 New Ave',
        contactPerson: 'Jane Doe',
        email: 'jane@test.com',
        phone: '555-5678',
      };

      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        branch_id: 2,
        headquarters_id: 1,
        name: 'New Branch',
        description: 'New Description',
        address: '456 New Ave',
        contact_person: 'Jane Doe',
        email: 'jane@test.com',
        phone: '555-5678',
      });

      const result = await repository.create(newBranch);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.branchId).toBe(2);
      expect(result.name).toBe('New Branch');
    });
  });

  describe('update', () => {
    it('should update existing branch and return updated data', async () => {
      const updateData = { name: 'Updated Branch' };

      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({
        branch_id: 1,
        headquarters_id: 1,
        name: 'Updated Branch',
        description: 'Test',
        address: '123 Branch St',
        contact_person: 'John',
        email: 'john@test.com',
        phone: '555-1234',
      });

      const result = await repository.update(1, updateData);

      expect(mockDb.run).toHaveBeenCalled();
      expect(result.name).toBe('Updated Branch');
    });

    it('should throw NotFoundError when branch does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.update(999, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing branch', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });

      await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM branches WHERE branch_id = ?', [1]);
    });

    it('should throw NotFoundError when branch does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when branch exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM branches WHERE branch_id = ?',
        [1],
      );
    });

    it('should return false when branch does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('findByHeadquartersId', () => {
    it('should return branches for headquarters', async () => {
      const mockResults = [
        {
          branch_id: 1,
          headquarters_id: 1,
          name: 'Branch 1',
          description: 'Test',
          address: '123 Branch St',
          contact_person: 'John',
          email: 'john@test.com',
          phone: '555-1234',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByHeadquartersId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name',
        [1],
      );
      expect(result).toHaveLength(1);
      expect(result[0].headquartersId).toBe(1);
    });
  });

  describe('findByName', () => {
    it('should return branches matching name pattern', async () => {
      const mockResults = [
        {
          branch_id: 1,
          headquarters_id: 1,
          name: 'Main Branch',
          description: 'Test',
          address: '123 Branch St',
          contact_person: 'John',
          email: 'john@test.com',
          phone: '555-1234',
        },
      ];
      mockDb.all.mockResolvedValue(mockResults);

      const result = await repository.findByName('Main');

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT * FROM branches WHERE name LIKE ? ORDER BY name',
        ['%Main%'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Main Branch');
    });
  });
});
