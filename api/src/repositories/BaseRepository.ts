/**
 * Base Repository Class
 * 
 * Provides generic CRUD operations for all repositories.
 * Child repositories can extend this class and add custom methods.
 */

import { DatabaseConnection } from '../db/sqlite';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

/**
 * Configuration interface for repository initialization
 */
export interface RepositoryConfig<T> {
  tableName: string;
  idField: string; // Database column name (snake_case), e.g., 'product_id'
  entityName: string; // Human-readable name for error messages, e.g., 'Product'
}

/**
 * Base repository class with generic CRUD operations
 */
export abstract class BaseRepository<T extends { [key: string]: any }> {
  protected db: DatabaseConnection;
  protected config: RepositoryConfig<T>;

  constructor(db: DatabaseConnection, config: RepositoryConfig<T>) {
    this.db = db;
    this.config = config;
  }

  /**
   * Get all entities
   */
  async findAll(): Promise<T[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM ${this.config.tableName} ORDER BY ${this.config.idField}`
      );
      return rows.map((row) => objectToCamelCase(row) as T);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get entity by ID
   */
  async findById(id: number): Promise<T | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT * FROM ${this.config.tableName} WHERE ${this.config.idField} = ?`,
        [id]
      );
      return row ? (objectToCamelCase(row) as T) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new entity
   */
  async create(entity: any): Promise<T> {
    try {
      const { sql, values } = buildInsertSQL(this.config.tableName, entity);
      const result = await this.db.run(sql, values);

      const createdEntity = await this.findById(result.lastID!);
      if (!createdEntity) {
        throw new Error(`Failed to retrieve created ${this.config.entityName}`);
      }

      return createdEntity;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update entity by ID
   */
  async update(id: number, entity: any): Promise<T> {
    try {
      const { sql, values } = buildUpdateSQL(
        this.config.tableName,
        entity,
        `${this.config.idField} = ?`
      );
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError(this.config.entityName, id);
      }

      const updatedEntity = await this.findById(id);
      if (!updatedEntity) {
        throw new Error(`Failed to retrieve updated ${this.config.entityName}`);
      }

      return updatedEntity;
    } catch (error) {
      handleDatabaseError(error, this.config.entityName, id);
    }
  }

  /**
   * Delete entity by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run(
        `DELETE FROM ${this.config.tableName} WHERE ${this.config.idField} = ?`,
        [id]
      );

      if (result.changes === 0) {
        throw new NotFoundError(this.config.entityName, id);
      }
    } catch (error) {
      handleDatabaseError(error, this.config.entityName, id);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${this.config.tableName} WHERE ${this.config.idField} = ?`,
        [id]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
