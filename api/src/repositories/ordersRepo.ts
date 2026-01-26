/**
 * Repository for orders data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Order } from '../models/order';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class OrdersRepository extends BaseRepository<Order> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'orders',
      idField: 'order_id',
      entityName: 'Order',
    });
  }

  /**
   * Find orders by branch ID
   */
  async findByBranchId(branchId: number): Promise<Order[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC',
        [branchId],
      );
      return rows.map((row) => objectToCamelCase(row) as Order);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: string): Promise<Order[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC',
        [status],
      );
      return rows.map((row) => objectToCamelCase(row) as Order);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
        [startDate, endDate],
      );
      return rows.map((row) => objectToCamelCase(row) as Order);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createOrdersRepository(isTest: boolean = false): Promise<OrdersRepository> {
  const db = await getDatabase(isTest);
  return new OrdersRepository(db);
}

// Singleton instance for default usage
let ordersRepo: OrdersRepository | null = null;

export async function getOrdersRepository(isTest: boolean = false): Promise<OrdersRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createOrdersRepository(true);
  }
  if (!ordersRepo) {
    ordersRepo = await createOrdersRepository(false);
  }
  return ordersRepo;
}
