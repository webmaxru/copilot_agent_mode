/**
 * Input validation and sanitization utilities
 */

import { ValidationError } from './errors';

/**
 * Validate that a value is a positive integer
 */
export function validatePositiveInteger(value: any, fieldName: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return num;
}

/**
 * Validate that a value is a non-negative integer
 */
export function validateNonNegativeInteger(value: any, fieldName: string): number {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative integer`);
  }
  return num;
}

/**
 * Validate and sanitize string input
 */
export function validateString(
  value: any,
  fieldName: string,
  options: { required?: boolean; maxLength?: number; minLength?: number } = {},
): string {
  const { required = true, maxLength, minLength } = options;

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return '';
  }

  const str = String(value).trim();

  if (minLength && str.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }

  if (maxLength && str.length > maxLength) {
    throw new ValidationError(`${fieldName} must not exceed ${maxLength} characters`);
  }

  return str;
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName: string = 'Email'): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = validateString(email, fieldName, { maxLength: 255 });

  if (!emailRegex.test(sanitized)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }

  return sanitized;
}

/**
 * Validate date format (ISO 8601)
 */
export function validateDate(date: string, fieldName: string): string {
  const sanitized = validateString(date, fieldName);
  const parsed = new Date(sanitized);

  if (isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid ISO 8601 date`);
  }

  return sanitized;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: any,
  allowedValues: readonly T[],
  fieldName: string,
): T {
  const sanitized = validateString(value, fieldName);

  if (!allowedValues.includes(sanitized as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    );
  }

  return sanitized as T;
}

/**
 * Sanitize search query to prevent SQL injection in LIKE clauses
 * Note: This should ONLY be used with parameterized queries.
 * The parameterized query prevents SQL injection, this just escapes wildcards
 * to prevent unintended LIKE pattern matching.
 */
export function sanitizeSearchQuery(query: string): string {
  // Escape SQL LIKE wildcards (% and _) using backslash
  return query.replace(/[%_\\]/g, '\\$&').trim();
}
