import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseSeeder } from './seed';
import { getDatabase, closeDatabase } from './sqlite';
import { runMigrations } from './migrate';

describe('DatabaseSeeder', () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should detect when database is not seeded', async () => {
    const db = await getDatabase();
    const seeder = new DatabaseSeeder(db, './sql/seed');
    
    // Access private method via type assertion for testing
    const isSeeded = await (seeder as any).isSeeded();
    
    expect(isSeeded).toBe(false);
  });

  it('should detect when database is seeded', async () => {
    const db = await getDatabase();
    
    // Seed a supplier to make it appear seeded
    await db.run(
      'INSERT INTO suppliers (name, description, contact_person, email, phone) VALUES (?, ?, ?, ?, ?)',
      ['Test Supplier', 'Test', 'John Doe', 'john@test.com', '555-1234'],
    );
    
    const seeder = new DatabaseSeeder(db, './sql/seed');
    const isSeeded = await (seeder as any).isSeeded();
    
    expect(isSeeded).toBe(true);
  });

  it('should get seed files from directory', async () => {
    const db = await getDatabase();
    const seeder = new DatabaseSeeder(db, './sql/seed');
    
    const files = (seeder as any).getSeedFiles();
    
    expect(Array.isArray(files)).toBe(true);
    // Seed files should be sorted
    if (files.length > 1) {
      expect(files[0] <= files[1]).toBe(true);
    }
  });

  it('should handle missing seed directory gracefully', async () => {
    const db = await getDatabase();
    const seeder = new DatabaseSeeder(db, './non-existent-directory');
    
    const files = (seeder as any).getSeedFiles();
    
    expect(files).toEqual([]);
  });

  it('should skip seeding if already seeded', async () => {
    const db = await getDatabase();
    
    // Pre-seed the database
    await db.run(
      'INSERT INTO suppliers (name, description, contact_person, email, phone) VALUES (?, ?, ?, ?, ?)',
      ['Test Supplier', 'Test', 'John Doe', 'john@test.com', '555-1234'],
    );
    
    const seeder = new DatabaseSeeder(db, './sql/seed');
    
    // This should skip because already seeded
    await seeder.seedDatabase();
    
    // Verify it didn't duplicate (should still be 1)
    const result = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM suppliers');
    expect(result?.count).toBe(1);
  });

  it('should accept force parameter', async () => {
    const db = await getDatabase();
    const seeder = new DatabaseSeeder(db, './non-existent-directory');
    
    // Force seeding with no seed files should complete successfully
    await expect(seeder.seedDatabase(true)).resolves.not.toThrow();
  });
});

describe('seedDatabase helper', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should successfully seed database', async () => {
    const { seedDatabase } = await import('./seed');
    
    // This should run without throwing
    await expect(seedDatabase()).resolves.not.toThrow();
  });
});
