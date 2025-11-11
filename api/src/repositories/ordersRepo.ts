/**
 * Repository for orders data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Order } from '../models/order';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

export class OrdersRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all orders
   */
  async findAll(): Promise<Order[]> {
    try {
      const rows = await this.db.all<any>('SELECT * FROM orders ORDER BY order_id');
      return rows.map((row) => objectToCamelCase(row) as Order);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get order by ID
   */
  async findById(id: number): Promise<Order | null> {
    try {
      const row = await this.db.get<any>('SELECT * FROM orders WHERE order_id = ?', [id]);
      return row ? (objectToCamelCase(row) as Order) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new order
   */
  async create(order: Omit<Order, 'orderId'>): Promise<Order> {
    try {
      const { sql, values } = buildInsertSQL('orders', order);
      const result = await this.db.run(sql, values);

      const createdOrder = await this.findById(result.lastID!);
      if (!createdOrder) {
        throw new Error('Failed to retrieve created order');
      }

      return createdOrder;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update order by ID
   */
  async update(id: number, order: Partial<Omit<Order, 'orderId'>>): Promise<Order> {
    try {
      const { sql, values } = buildUpdateSQL('orders', order, 'order_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Order', id);
      }

      const updatedOrder = await this.findById(id);
      if (!updatedOrder) {
        throw new Error('Failed to retrieve updated order');
      }

      return updatedOrder;
    } catch (error) {
      handleDatabaseError(error, 'Order', id);
    }
  }

  /**
   * Delete order by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM orders WHERE order_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Order', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Order', id);
    }
  }

  /**
   * Check if order exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM orders WHERE order_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
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

  /**
   * Find active cart for a branch (status='cart')
   */
  async findActiveCart(branchId: number): Promise<Order | null> {
    try {
      const row = await this.db.get<any>(
        'SELECT * FROM orders WHERE branch_id = ? AND status = ? ORDER BY order_date DESC LIMIT 1',
        [branchId, 'cart'],
      );
      return row ? (objectToCamelCase(row) as Order) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    try {
      const result = await this.db.run('UPDATE orders SET status = ? WHERE order_id = ?', [
        status,
        id,
      ]);

      if (result.changes === 0) {
        throw new NotFoundError('Order', id);
      }

      const updatedOrder = await this.findById(id);
      if (!updatedOrder) {
        throw new Error('Failed to retrieve updated order');
      }

      return updatedOrder;
    } catch (error) {
      handleDatabaseError(error, 'Order', id);
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
