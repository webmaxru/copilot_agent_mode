/**
 * Repository for users data access
 */

import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { User, UserWithPassword } from '../models/user';
import { handleDatabaseError, NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase } from '../utils/sql';

/**
 * Hash a plain-text password using scrypt with a random salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain-text password against a stored hash
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hash, 'hex');
  return timingSafeEqual(derivedKey, storedHash);
}

export class UsersRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Map a raw database row to a User object (excluding passwordHash)
   */
  private rowToUser(row: any): User {
    const camel = objectToCamelCase(row) as any;
    return {
      userId: camel.userId,
      email: camel.email,
      name: camel.name,
      role: camel.role,
      createdAt: camel.createdAt,
    };
  }

  /**
   * Map a raw database row to a UserWithPassword object
   */
  private rowToUserWithPassword(row: any): UserWithPassword {
    const camel = objectToCamelCase(row) as any;
    return {
      userId: camel.userId,
      email: camel.email,
      name: camel.name,
      role: camel.role,
      createdAt: camel.createdAt,
      passwordHash: camel.passwordHash,
    };
  }

  /**
   * Get all users (without password hashes)
   */
  async findAll(): Promise<User[]> {
    try {
      const rows = await this.db.all<any>(
        'SELECT user_id, email, name, role, created_at FROM users ORDER BY user_id',
      );
      return rows.map((row) => this.rowToUser(row));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get user by ID (without password hash)
   */
  async findById(id: number): Promise<User | null> {
    try {
      const row = await this.db.get<any>(
        'SELECT user_id, email, name, role, created_at FROM users WHERE user_id = ?',
        [id],
      );
      return row ? this.rowToUser(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get user by email (includes password hash for authentication)
   */
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const row = await this.db.get<any>(
        'SELECT user_id, email, name, role, created_at, password_hash FROM users WHERE email = ?',
        [email],
      );
      return row ? this.rowToUserWithPassword(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new user account
   */
  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'admin';
  }): Promise<User> {
    try {
      if (!data.email || !data.password || !data.name) {
        throw new ValidationError('email, password, and name are required');
      }
      if (data.password.length < 8) {
        throw new ValidationError('password must be at least 8 characters');
      }

      const passwordHash = hashPassword(data.password);
      const { sql, values } = buildInsertSQL('users', {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role ?? 'user',
      });
      const result = await this.db.run(sql, values);

      const created = await this.findById(result.lastID!);
      if (!created) {
        throw new Error('Failed to retrieve created user');
      }
      return created;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update user profile (name and/or role). Password changes use updatePassword.
   */
  async update(
    id: number,
    data: Partial<{ name: string; role: 'user' | 'admin' }>,
  ): Promise<User> {
    try {
      const { sql, values } = buildUpdateSQL('users', data, 'user_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('User', id);
      }

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Failed to retrieve updated user');
      }
      return updated;
    } catch (error) {
      handleDatabaseError(error, 'User', id);
    }
  }

  /**
   * Update a user's password
   */
  async updatePassword(id: number, newPassword: string): Promise<void> {
    try {
      if (newPassword.length < 8) {
        throw new ValidationError('password must be at least 8 characters');
      }
      const passwordHash = hashPassword(newPassword);
      const result = await this.db.run(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [passwordHash, id],
      );
      if (result.changes === 0) {
        throw new NotFoundError('User', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'User', id);
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM users WHERE user_id = ?', [id]);
      if (result.changes === 0) {
        throw new NotFoundError('User', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'User', id);
    }
  }

  /**
   * Validate login credentials. Returns the user if credentials match, null otherwise.
   */
  async validateCredentials(email: string, password: string): Promise<User | null> {
    try {
      const userWithPw = await this.findByEmail(email);
      if (!userWithPw) return null;
      if (!verifyPassword(password, userWithPw.passwordHash)) return null;
      const { passwordHash: _, ...user } = userWithPw;
      return user as User;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Check whether a user with the given ID exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE user_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function
export async function createUsersRepository(isTest: boolean = false): Promise<UsersRepository> {
  const db = await getDatabase(isTest);
  return new UsersRepository(db);
}

// Singleton instances (separate for test and production)
const usersRepoInstances = new Map<boolean, UsersRepository>();

export async function getUsersRepository(isTest: boolean = false): Promise<UsersRepository> {
  if (!usersRepoInstances.has(isTest)) {
    usersRepoInstances.set(isTest, await createUsersRepository(isTest));
  }
  return usersRepoInstances.get(isTest)!;
}
