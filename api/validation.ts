/**
 * Backend Input Validation Utilities for Vercel API Routes
 * Prevents injection attacks and malformed requests
 */

/**
 * Validate and sanitize string input
 * @param input - Input to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeInput(input: any, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`);
  }

  return input.trim();
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Sanitized email
 */
export function validateEmail(email: any): string {
  const sanitized = sanitizeInput(email, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized.toLowerCase();
}

/**
 * Validate token format (for CAPTCHA, CSRF, etc)
 * @param token - Token to validate
 * @returns Sanitized token
 */
export function validateToken(token: any): string {
  const sanitized = sanitizeInput(token, 10000);

  if (sanitized.length < 10) {
    throw new Error('Token is too short');
  }

  return sanitized;
}

/**
 * Validate JSON structure
 * @param data - Data to validate
 * @param requiredFields - Fields that must be present
 */
export function validateJSON(data: any, requiredFields: string[]): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Prevent NoSQL injection by validating query operators
 * @param value - Value to check
 * @returns true if safe
 */
export function isSafeValue(value: any): boolean {
  if (typeof value === 'string') {
    // Block MongoDB operators
    const dangerousPatterns = [
      /^\$/, // MongoDB operators like $ne, $gt
      /^{.*}$/, // Objects that might contain operators
    ];
    return !dangerousPatterns.some(pattern => pattern.test(value));
  }
  return true;
}

/**
 * Sanitize object by removing potentially dangerous fields
 * @param obj - Object to sanitize
 * @param allowedFields - Whitelist of allowed fields
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in obj) {
      const value = obj[field];
      if (isSafeValue(value)) {
        sanitized[field] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Validate IP address format
 * @param ip - IP address to validate
 * @returns true if valid IP
 */
export function isValidIP(ip: string): boolean {
  // Basic IPv4 and IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}$/i;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Validate request method
 * @param method - HTTP method to validate
 * @param allowedMethods - Allowed methods
 * @returns true if valid
 */
export function isValidMethod(method: any, allowedMethods: string[]): boolean {
  return typeof method === 'string' && allowedMethods.includes(method.toUpperCase());
}
