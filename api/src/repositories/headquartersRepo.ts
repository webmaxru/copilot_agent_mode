/**
 * Repository for headquarters data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Headquarters } from '../models/headquarters';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class HeadquartersRepository extends BaseRepository<Headquarters> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'headquarters',
      idField: 'headquarters_id',
      entityName: 'Headquarters',
    });
  }

  /**
   * Find headquarters by name (partial match)
   */
  async findByName(name: string): Promise<Headquarters[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM headquarters WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return rows.map((row) => objectToCamelCase(row) as Headquarters);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createHeadquartersRepository(
  isTest: boolean = false,
): Promise<HeadquartersRepository> {
  const db = await getDatabase(isTest);
  return new HeadquartersRepository(db);
}

// Singleton instance for default usage
let headquartersRepo: HeadquartersRepository | null = null;

export async function getHeadquartersRepository(
  isTest: boolean = false,
): Promise<HeadquartersRepository> {
  if (!headquartersRepo) {
    headquartersRepo = await createHeadquartersRepository(isTest);
  }
  return headquartersRepo;
}
