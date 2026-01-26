/**
 * Repository for order details data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { OrderDetail } from '../models/orderDetail';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class OrderDetailsRepository extends BaseRepository<OrderDetail> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'order_details',
      idField: 'order_detail_id',
      entityName: 'OrderDetail',
    });
  }

  /**
   * Find order details by order ID
   */
  async findByOrderId(orderId: number): Promise<OrderDetail[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM order_details WHERE order_id = ? ORDER BY order_detail_id',
        [orderId],
      );
      return rows.map((row) => objectToCamelCase(row) as OrderDetail);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find order details by product ID
   */
  async findByProductId(productId: number): Promise<OrderDetail[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM order_details WHERE product_id = ? ORDER BY order_detail_id',
        [productId],
      );
      return rows.map((row) => objectToCamelCase(row) as OrderDetail);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Calculate total value for an order
   */
  async getTotalValueByOrderId(orderId: number): Promise<number> {
    try {
      const result = await this.db.get<{ total: number }>(
        'SELECT SUM(quantity * unit_price) as total FROM order_details WHERE order_id = ?',
        [orderId],
      );
      return result?.total || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createOrderDetailsRepository(
  isTest: boolean = false,
): Promise<OrderDetailsRepository> {
  const db = await getDatabase(isTest);
  return new OrderDetailsRepository(db);
}

// Singleton instance for default usage
let orderDetailsRepo: OrderDetailsRepository | null = null;

export async function getOrderDetailsRepository(
  isTest: boolean = false,
): Promise<OrderDetailsRepository> {
  if (!orderDetailsRepo) {
    orderDetailsRepo = await createOrderDetailsRepository(isTest);
  }
  return orderDetailsRepo;
}
