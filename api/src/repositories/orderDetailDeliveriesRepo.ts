/**
 * Repository for order detail deliveries data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { OrderDetailDelivery } from '../models/orderDetailDelivery';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class OrderDetailDeliveriesRepository extends BaseRepository<OrderDetailDelivery> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'order_detail_deliveries',
      idField: 'order_detail_delivery_id',
      entityName: 'OrderDetailDelivery',
    });
  }

  /**
   * Find order detail deliveries by order detail ID
   */
  async findByOrderDetailId(orderDetailId: number): Promise<OrderDetailDelivery[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM order_detail_deliveries WHERE order_detail_id = ? ORDER BY order_detail_delivery_id',
        [orderDetailId],
      );
      return rows.map((row) => objectToCamelCase(row) as OrderDetailDelivery);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find order detail deliveries by delivery ID
   */
  async findByDeliveryId(deliveryId: number): Promise<OrderDetailDelivery[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM order_detail_deliveries WHERE delivery_id = ? ORDER BY order_detail_delivery_id',
        [deliveryId],
      );
      return rows.map((row) => objectToCamelCase(row) as OrderDetailDelivery);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get total quantity delivered for an order detail
   */
  async getTotalQuantityByOrderDetailId(orderDetailId: number): Promise<number> {
    try {
      const result = await this.db.get<{ total: number }>(
        'SELECT SUM(quantity) as total FROM order_detail_deliveries WHERE order_detail_id = ?',
        [orderDetailId],
      );
      return result?.total || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createOrderDetailDeliveriesRepository(
  isTest: boolean = false,
): Promise<OrderDetailDeliveriesRepository> {
  const db = await getDatabase(isTest);
  return new OrderDetailDeliveriesRepository(db);
}

// Singleton instance for default usage
let orderDetailDeliveriesRepo: OrderDetailDeliveriesRepository | null = null;

export async function getOrderDetailDeliveriesRepository(
  isTest: boolean = false,
): Promise<OrderDetailDeliveriesRepository> {
  if (!orderDetailDeliveriesRepo) {
    orderDetailDeliveriesRepo = await createOrderDetailDeliveriesRepository(isTest);
  }
  return orderDetailDeliveriesRepo;
}
