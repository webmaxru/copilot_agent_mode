/**
 * Repository for branches data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Branch } from '../models/branch';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class BranchesRepository extends BaseRepository<Branch> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'branches',
      idField: 'branch_id',
      entityName: 'Branch',
    });
  }

  /**
   * Find branches by headquarters ID
   */
  async findByHeadquartersId(headquartersId: number): Promise<Branch[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM branches WHERE headquarters_id = ? ORDER BY name',
        [headquartersId],
      );
      return rows.map((row) => objectToCamelCase(row) as Branch);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find branches by name (partial match)
   */
  async findByName(name: string): Promise<Branch[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM branches WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return rows.map((row) => objectToCamelCase(row) as Branch);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createBranchesRepository(
  isTest: boolean = false,
): Promise<BranchesRepository> {
  const db = await getDatabase(isTest);
  return new BranchesRepository(db);
}

// Singleton instance for default usage
let branchesRepo: BranchesRepository | null = null;

export async function getBranchesRepository(isTest: boolean = false): Promise<BranchesRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    // In tests, always return a fresh repository bound to the current in-memory DB
    return createBranchesRepository(true);
  }
  if (!branchesRepo) {
    branchesRepo = await createBranchesRepository(false);
  }
  return branchesRepo;
}
