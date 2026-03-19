import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersRepository, hashPassword, verifyPassword } from '../repositories/usersRepo';
import { NotFoundError, ValidationError } from '../utils/errors';

// Mock the getDatabase function first
vi.mock('../db/sqlite', () => ({
  getDatabase: vi.fn(),
}));

import { getDatabase } from '../db/sqlite';

describe('hashPassword / verifyPassword', () => {
  it('should produce a hash that verifies correctly', () => {
    const hash = hashPassword('secret123');
    expect(verifyPassword('secret123', hash)).toBe(true);
  });

  it('should reject an incorrect password', () => {
    const hash = hashPassword('secret123');
    expect(verifyPassword('wrong', hash)).toBe(false);
  });

  it('should produce different hashes for the same password (random salt)', () => {
    const h1 = hashPassword('secret123');
    const h2 = hashPassword('secret123');
    expect(h1).not.toBe(h2);
  });
});

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockDb: any;

  const dbRow = {
    user_id: 1,
    email: 'alice@example.com',
    name: 'Alice',
    role: 'user',
    created_at: '2024-01-01T00:00:00.000Z',
    password_hash: hashPassword('password1'),
  };

  beforeEach(() => {
    mockDb = {
      db: {} as any,
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    (getDatabase as any).mockResolvedValue(mockDb);
    repository = new UsersRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users without password hashes', async () => {
      mockDb.all.mockResolvedValue([dbRow]);

      const result = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT user_id, email, name, role, created_at FROM users ORDER BY user_id',
      );
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(1);
      expect(result[0].email).toBe('alice@example.com');
      expect((result[0] as any).passwordHash).toBeUndefined();
    });

    it('should return empty array when no users exist', async () => {
      mockDb.all.mockResolvedValue([]);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockDb.get.mockResolvedValue(dbRow);

      const result = await repository.findById(1);

      expect(result?.userId).toBe(1);
      expect(result?.email).toBe('alice@example.com');
      expect((result as any)?.passwordHash).toBeUndefined();
    });

    it('should return null when user not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user with password hash when found', async () => {
      mockDb.get.mockResolvedValue(dbRow);

      const result = await repository.findByEmail('alice@example.com');

      expect(result?.email).toBe('alice@example.com');
      expect(result?.passwordHash).toBeDefined();
    });

    it('should return null when email not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user and return it without password hash', async () => {
      mockDb.run.mockResolvedValue({ lastID: 2, changes: 1 });
      mockDb.get.mockResolvedValue({
        user_id: 2,
        email: 'bob@example.com',
        name: 'Bob',
        role: 'user',
        created_at: '2024-01-02T00:00:00.000Z',
      });

      const result = await repository.create({
        email: 'bob@example.com',
        password: 'securePass1',
        name: 'Bob',
      });

      expect(result.userId).toBe(2);
      expect(result.email).toBe('bob@example.com');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw ValidationError when password is too short', async () => {
      await expect(
        repository.create({ email: 'x@y.com', password: 'short', name: 'X' }),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when required fields are missing', async () => {
      await expect(
        repository.create({ email: '', password: 'longenough', name: 'X' }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('update', () => {
    it('should update user name and return updated user', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      mockDb.get.mockResolvedValue({ ...dbRow, name: 'Alice Updated' });

      const result = await repository.update(1, { name: 'Alice Updated' });

      expect(result.name).toBe('Alice Updated');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.update(999, { name: 'Nobody' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing user', async () => {
      mockDb.run.mockResolvedValue({ changes: 1 });
      await repository.delete(1);
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM users WHERE user_id = ?', [1]);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockDb.run.mockResolvedValue({ changes: 0 });
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('validateCredentials', () => {
    it('should return user when credentials are valid', async () => {
      const pw = 'password1';
      const hash = hashPassword(pw);
      mockDb.get.mockResolvedValue({ ...dbRow, password_hash: hash });

      const result = await repository.validateCredentials('alice@example.com', pw);

      expect(result).not.toBeNull();
      expect(result?.email).toBe('alice@example.com');
      expect((result as any)?.passwordHash).toBeUndefined();
    });

    it('should return null when password is wrong', async () => {
      mockDb.get.mockResolvedValue(dbRow);
      const result = await repository.validateCredentials('alice@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null when email is not found', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await repository.validateCredentials('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      mockDb.get.mockResolvedValue({ count: 1 });
      const result = await repository.exists(1);
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      const result = await repository.exists(999);
      expect(result).toBe(false);
    });
  });
});
