/**
 * Repository for deliveries data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Delivery } from '../models/delivery';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class DeliveriesRepository extends BaseRepository<Delivery> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'deliveries',
      idField: 'delivery_id',
      entityName: 'Delivery',
    });
  }

  /**
   * Find deliveries by supplier ID
   */
  async findBySupplierId(supplierId: number): Promise<Delivery[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM deliveries WHERE supplier_id = ? ORDER BY delivery_date DESC',
        [supplierId],
      );
      return rows.map((row) => objectToCamelCase(row) as Delivery);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find deliveries by status
   */
  async findByStatus(status: string): Promise<Delivery[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM deliveries WHERE status = ? ORDER BY delivery_date DESC',
        [status],
      );
      return rows.map((row) => objectToCamelCase(row) as Delivery);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find deliveries by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Delivery[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM deliveries WHERE delivery_date >= ? AND delivery_date <= ? ORDER BY delivery_date DESC',
        [startDate, endDate],
      );
      return rows.map((row) => objectToCamelCase(row) as Delivery);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update delivery status
   */
  async updateStatus(id: number, status: string): Promise<Delivery> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      handleDatabaseError(error, 'Delivery', id);
    }
  }
}

// Factory function to create repository instance
export async function createDeliveriesRepository(
  isTest: boolean = false,
): Promise<DeliveriesRepository> {
  const db = await getDatabase(isTest);
  return new DeliveriesRepository(db);
}

// Singleton instance for default usage
let deliveriesRepo: DeliveriesRepository | null = null;

export async function getDeliveriesRepository(
  isTest: boolean = false,
): Promise<DeliveriesRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createDeliveriesRepository(true);
  }
  if (!deliveriesRepo) {
    deliveriesRepo = await createDeliveriesRepository(false);
  }
  return deliveriesRepo;
}
