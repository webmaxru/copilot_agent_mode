/**
 * Repository for suppliers data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Supplier } from '../models/supplier';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class SuppliersRepository extends BaseRepository<Supplier> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'suppliers',
      idField: 'supplier_id',
      entityName: 'Supplier',
    });
  }

  /**
   * Find suppliers by name (partial match)
   */
  async findByName(name: string): Promise<Supplier[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM suppliers WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return rows.map((row) => objectToCamelCase(row) as Supplier);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createSuppliersRepository(
  isTest: boolean = false,
): Promise<SuppliersRepository> {
  const db = await getDatabase(isTest);
  return new SuppliersRepository(db);
}

// Singleton instance for default usage
let suppliersRepo: SuppliersRepository | null = null;

export async function getSuppliersRepository(
  isTest: boolean = false,
): Promise<SuppliersRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createSuppliersRepository(true);
  }
  if (!suppliersRepo) {
    suppliersRepo = await createSuppliersRepository(false);
  }
  return suppliersRepo;
}
