/**
 * Repository for order details data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { OrderDetail } from '../models/orderDetail';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

export class OrderDetailsRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all order details
   */
  async findAll(): Promise<OrderDetail[]> {
    try {
      const rows = await this.db.all<any>('SELECT * FROM order_details ORDER BY order_detail_id');
      return rows.map((row) => objectToCamelCase(row) as OrderDetail);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get order detail by ID
   */
  async findById(id: number): Promise<OrderDetail | null> {
    try {
      const row = await this.db.get<any>('SELECT * FROM order_details WHERE order_detail_id = ?', [
        id,
      ]);
      return row ? (objectToCamelCase(row) as OrderDetail) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new order detail
   */
  async create(orderDetail: Omit<OrderDetail, 'orderDetailId'>): Promise<OrderDetail> {
    try {
      const { sql, values } = buildInsertSQL('order_details', orderDetail);
      const result = await this.db.run(sql, values);

      const createdOrderDetail = await this.findById(result.lastID!);
      if (!createdOrderDetail) {
        throw new Error('Failed to retrieve created order detail');
      }

      return createdOrderDetail;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update order detail by ID
   */
  async update(
    id: number,
    orderDetail: Partial<Omit<OrderDetail, 'orderDetailId'>>,
  ): Promise<OrderDetail> {
    try {
      const { sql, values } = buildUpdateSQL('order_details', orderDetail, 'order_detail_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('OrderDetail', id);
      }

      const updatedOrderDetail = await this.findById(id);
      if (!updatedOrderDetail) {
        throw new Error('Failed to retrieve updated order detail');
      }

      return updatedOrderDetail;
    } catch (error) {
      handleDatabaseError(error, 'OrderDetail', id);
    }
  }

  /**
   * Delete order detail by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM order_details WHERE order_detail_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('OrderDetail', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'OrderDetail', id);
    }
  }

  /**
   * Check if order detail exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM order_details WHERE order_detail_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
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

  /**
   * Find or create order detail for a product in an order (upsert for cart items)
   */
  async upsertCartItem(
    orderId: number,
    productId: number,
    quantity: number,
    unitPrice: number,
  ): Promise<OrderDetail> {
    try {
      // Check if item already exists
      const existing = await this.db.get<any>(
        'SELECT * FROM order_details WHERE order_id = ? AND product_id = ?',
        [orderId, productId],
      );

      if (existing) {
        // Update existing item quantity
        const newQuantity = existing.quantity + quantity;
        return await this.update(existing.order_detail_id, { quantity: newQuantity });
      } else {
        // Create new item
        return await this.create({
          orderId,
          productId,
          quantity,
          unitPrice,
          notes: '',
        });
      }
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
