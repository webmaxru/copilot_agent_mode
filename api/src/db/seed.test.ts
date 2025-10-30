import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseSeeder } from './seed';

// Mock the fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

import fs from 'fs';

describe('DatabaseSeeder', () => {
  let mockDb: any;
  let seeder: DatabaseSeeder;

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

  describe('seedDatabase', () => {
    it('should skip seeding if database already seeded', async () => {
      mockDb.get.mockResolvedValue({ count: 5 }); // Database has data
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['001_suppliers.sql']);

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.seedDatabase(false);

      // Should not read seed files if already seeded
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });

    it('should seed database when forced', async () => {
      mockDb.get.mockResolvedValue({ count: 5 }); // Database has data
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['001_suppliers.sql']);
      (fs.readFileSync as any).mockReturnValue("INSERT INTO suppliers VALUES (1, 'Test');");

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.seedDatabase(true);

      // Should read and execute seed files even if already seeded
      expect(fs.readdirSync).toHaveBeenCalled();
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('should execute all seed files in order', async () => {
      mockDb.get.mockResolvedValue({ count: 0 }); // Database is empty
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue(['001_suppliers.sql', '002_products.sql']);
      (fs.readFileSync as any).mockReturnValue("INSERT INTO test VALUES (1, 'Test');");

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.seedDatabase(false);

      // Should execute SQL from both seed files
      const runCalls = mockDb.run.mock.calls.filter((call: any[]) => call[0].includes('INSERT'));
      expect(runCalls.length).toBeGreaterThanOrEqual(2);
    });

    it('should skip seeding if no seed files found', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readdirSync as any).mockReturnValue([]);

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.seedDatabase(false);

      // Should not attempt to execute any SQL
      const insertCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT'),
      );
      expect(insertCalls.length).toBe(0);
    });

    it('should skip if seeds directory does not exist', async () => {
      mockDb.get.mockResolvedValue({ count: 0 });
      (fs.existsSync as any).mockReturnValue(false);

      seeder = new DatabaseSeeder(mockDb, './nonexistent/seeds');
      await seeder.seedDatabase(false);

      // Should not attempt to read directory
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });
  });

  describe('clearDatabase', () => {
    it('should clear all tables except migrations', async () => {
      mockDb.all.mockResolvedValue([
        { name: 'suppliers' },
        { name: 'products' },
        { name: 'orders' },
      ]);

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.clearDatabase();

      // Should delete from all non-system tables
      const deleteCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        call[0].includes('DELETE FROM'),
      );
      expect(deleteCalls.length).toBe(3);
    });

    it('should disable and re-enable foreign keys', async () => {
      mockDb.all.mockResolvedValue([{ name: 'suppliers' }]);

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.clearDatabase();

      // Should disable foreign keys before clearing
      expect(mockDb.run).toHaveBeenCalledWith('PRAGMA foreign_keys = OFF');
      // Should re-enable foreign keys after clearing
      expect(mockDb.run).toHaveBeenCalledWith('PRAGMA foreign_keys = ON');
    });

    it('should handle empty database', async () => {
      mockDb.all.mockResolvedValue([]);

      seeder = new DatabaseSeeder(mockDb, './test/seeds');
      await seeder.clearDatabase();

      // Should not attempt to delete from any tables
      const deleteCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        call[0].includes('DELETE FROM'),
      );
      expect(deleteCalls.length).toBe(0);
    });
  });
});
