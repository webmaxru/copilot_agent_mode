/**
 * Repository for products data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Product } from '../models/product';
import { handleDatabaseError } from '../utils/errors';
import { objectToCamelCase } from '../utils/sql';
import { BaseRepository } from './BaseRepository';

export class ProductsRepository extends BaseRepository<Product> {
  constructor(db: DatabaseConnection) {
    super(db, {
      tableName: 'products',
      idField: 'product_id',
      entityName: 'Product',
    });
  }

  /**
   * Find products by supplier ID
   */
  async findBySupplierId(supplierId: number): Promise<Product[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM products WHERE supplier_id = ? ORDER BY name',
        [supplierId],
      );
      return rows.map((row) => objectToCamelCase(row) as Product);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find products by name (partial match)
   */
  async findByName(name: string): Promise<Product[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT * FROM products WHERE name LIKE ? ORDER BY name',
        [`%${name}%`],
      );
      return rows.map((row) => objectToCamelCase(row) as Product);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createProductsRepository(
  isTest: boolean = false,
): Promise<ProductsRepository> {
  const db = await getDatabase(isTest);
  return new ProductsRepository(db);
}

// Singleton instance for default usage
let productsRepo: ProductsRepository | null = null;

export async function getProductsRepository(isTest: boolean = false): Promise<ProductsRepository> {
  if (!productsRepo) {
    productsRepo = await createProductsRepository(isTest);
  }
  return productsRepo;
}
