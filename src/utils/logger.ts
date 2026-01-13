// Debug logger utility
// Usage: import { logger } from "@/utils/logger";
// Enable debug mode by setting localStorage.setItem('CLOTHIFY_DEBUG_MODE', 'true') in the browser console

const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('CLOTHIFY_DEBUG_MODE') === 'true';
};

export const logger = {
  log: (...args: any[]) => {
    if (isDebugMode()) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDebugMode()) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDebugMode()) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDebugMode()) {
      console.error(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDebugMode()) {
      console.debug(...args);
    }
  }
};
