/**
 * Input Validation Utilities
 * Prevents XSS, SQL injection, and other malicious inputs
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param input - User input to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return escapeMap[char] || char;
    });
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Object with validity and error message
 */
export function isValidEmail(email: string): { valid: boolean; message: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 * @param password - Password to validate
 * @returns Object with validity and error message
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: '' };
}

/**
 * Sanitize numeric input
 * @param input - Input to convert to safe number
 * @returns Safe number or 0
 */
export function sanitizeNumber(input: any): number {
  const num = Number(input);
  return isNaN(num) ? 0 : num;
}

/**
 * Validate URL to prevent open redirects
 * @param url - URL to validate
 * @param allowedDomains - Domains to allow (if not provided, allows relative URLs only)
 * @returns Object with validity and error message
 */
export function isValidURL(url: string, allowedDomains?: string[]): { valid: boolean; message: string } {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, message: 'Invalid URL protocol' };
    }
    
    // If allowedDomains is provided, check against them
    if (allowedDomains && allowedDomains.length > 0) {
      if (!allowedDomains.includes(urlObj.hostname)) {
        return { valid: false, message: 'URL domain not allowed' };
      }
    }
    
    // Allow same-origin URLs or if whitelist provided
    if (!allowedDomains && urlObj.origin !== window.location.origin) {
      return { valid: false, message: 'URL must be same-origin or whitelisted' };
    }
    
    return { valid: true, message: '' };
  } catch {
    // If URL parsing fails, it's invalid
    return { valid: false, message: 'Invalid URL format' };
  }
}

/**
 * Remove any HTML/script tags from input
 * @param input - Input to clean
 * @returns Clean string
 */
export function stripHTMLTags(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate CSRF token format
 * @param token - Token to validate
 * @returns Object with validity and error message
 */
export function isValidCSRFToken(token: string): { valid: boolean; message: string } {
  // Tokens are typically 32-64 character hex strings
  if (!/^[a-f0-9]{32,64}$/i.test(token)) {
    return { valid: false, message: 'Invalid CSRF token format' };
  }
  return { valid: true, message: '' };
}

/**
 * Sanitize object input (used for form data)
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as any;
    } else if (typeof value === 'number') {
      sanitized[key as keyof T] = sanitizeNumber(value) as any;
    } else if (value === null || value === undefined) {
      sanitized[key as keyof T] = value as any;
    } else if (typeof value === 'boolean') {
      sanitized[key as keyof T] = value as any;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key as keyof T] = sanitizeObject(value) as any;
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string' ? sanitizeString(item) : item
      ) as any;
    }
  }
  
  return sanitized;
}

/**
 * Validate input length to prevent buffer overflow
 * @param input - Input to check
 * @param maxLength - Maximum allowed length
 * @returns Object with validity and error message
 */
export function isValidLength(input: string, maxLength: number): { valid: boolean; message: string } {
  if (input.length > maxLength) {
    return { valid: false, message: `Input exceeds maximum length of ${maxLength} characters` };
  }
  return { valid: true, message: '' };
}
