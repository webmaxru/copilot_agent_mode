import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MigrationRunner } from './migrate';

// Mock the fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

import fs from 'fs';

describe('MigrationRunner', () => {
  let mockDb: any;
  let runner: MigrationRunner;

  beforeEach(() => {
    mockDb = {
      run: vi.fn().mockResolvedValue({ changes: 1 }),
      get: vi.fn(),
      all: vi.fn(),
      close: vi.fn(),
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create migrations table', async () => {
      mockDb.all.mockResolvedValue([]);
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue([]);

      runner = new MigrationRunner(mockDb, './test/migrations');
      await runner.runMigrations();

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS migrations'),
      );
    });
  });

  describe('getCurrentVersion', () => {
    it('should return 0 when no migrations have been applied', async () => {
      mockDb.get.mockResolvedValue({ version: null });
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue([]);

      runner = new MigrationRunner(mockDb, './test/migrations');
      const version = await runner.getCurrentVersion();

      expect(version).toBe(0);
    });

    it('should return the current version', async () => {
      mockDb.get.mockResolvedValue({ version: 3 });
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue([]);

      runner = new MigrationRunner(mockDb, './test/migrations');
      const version = await runner.getCurrentVersion();

      expect(version).toBe(3);
    });
  });

  describe('runMigrations', () => {
    it('should skip when no pending migrations exist', async () => {
      mockDb.all.mockResolvedValue([{ version: 1 }]);
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['001_init.sql']);
      (fs.readFileSync as any).mockReturnValue('CREATE TABLE test (id INTEGER);');

      runner = new MigrationRunner(mockDb, './test/migrations');
      await runner.runMigrations();

      // Should not attempt to insert migration record if already applied
      const insertCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO migrations'),
      );
      expect(insertCalls.length).toBe(0);
    });

    it('should apply pending migrations in order', async () => {
      mockDb.all.mockResolvedValue([]);
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['001_init.sql', '002_add_users.sql']);
      (fs.readFileSync as any).mockReturnValue('CREATE TABLE test (id INTEGER);');

      runner = new MigrationRunner(mockDb, './test/migrations');
      await runner.runMigrations();

      // Should apply both migrations
      const insertCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO migrations'),
      );
      expect(insertCalls.length).toBe(2);
    });

    it('should throw error for invalid migration filename', async () => {
      mockDb.all.mockResolvedValue([]);
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['invalid_filename.sql']);

      runner = new MigrationRunner(mockDb, './test/migrations');

      await expect(runner.runMigrations()).rejects.toThrow('Invalid migration filename format');
    });

    it('should throw error if migrations directory does not exist', async () => {
      (fs.existsSync as any).mockReturnValue(false);

      runner = new MigrationRunner(mockDb, './nonexistent/migrations');

      await expect(runner.runMigrations()).rejects.toThrow('Migrations directory not found');
    });
  });
});
