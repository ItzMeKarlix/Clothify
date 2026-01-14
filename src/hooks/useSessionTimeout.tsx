import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/api';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import React from 'react';

interface SessionTimeoutOptions {
  enabled: boolean;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

const DEFAULT_TIMEOUT_MINUTES = 15;
const DEFAULT_WARNING_MINUTES = 2;
const STORAGE_KEY = 'session_timeout_enabled';

/**
 * Hook to handle automatic logout after user inactivity
 * Tracks mouse, keyboard, and touch events to detect user activity
 */
export const useSessionTimeout = (options?: SessionTimeoutOptions) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(0);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get settings from options or localStorage
  const [isEnabled, setIsEnabled] = useState(() => {
    if (options?.enabled !== undefined) return options.enabled;
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default to true if not set
    return stored === null ? true : stored === 'true';
  });

  const timeoutMinutes = options?.timeoutMinutes ?? DEFAULT_TIMEOUT_MINUTES;
  const warningMinutes = options?.warningMinutes ?? DEFAULT_WARNING_MINUTES;

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

  // Listen for storage changes to sync across tabs/components
  useEffect(() => {
    if (options?.enabled !== undefined) return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === STORAGE_KEY) {
          setIsEnabled(e.newValue === 'true');
        }
      } else {
        // Custom event for same-window updates
        setIsEnabled(localStorage.getItem(STORAGE_KEY) === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('session-timeout-settings-changed', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-timeout-settings-changed', handleStorageChange as EventListener);
    };
  }, [options?.enabled]);

  const handleLogout = async () => {
    logger.log('🔒 Session timeout: Logging out due to inactivity');
    try {
      await authService.logout();
      navigate('/login');
      toast.error('Session expired due to inactivity', { id: 'session-timeout' });
    } catch (err) {
      logger.error('Error during timeout logout:', err);
      navigate('/login');
    }
  };

  const clearAllTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
    setShowWarning(false);
    setWarningSeconds(0);
  };

  const showWarningDialog = () => {
    setShowWarning(true);
    setWarningSeconds(warningMinutes * 60);

    // Countdown timer for warning
    warningIntervalRef.current = setInterval(() => {
      setWarningSeconds((prev) => {
        if (prev <= 1) {
          if (warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Session Expiring Soon</p>
        <p className="text-sm">
          Your session will expire in {Math.floor(warningSeconds / 60)}:
          {String(warningSeconds % 60).padStart(2, '0')} due to inactivity.
        </p>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            resetTimer();
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Stay Logged In
        </button>
      </div>
    ), {
      duration: warningMinutes * 60 * 1000,
      id: 'session-warning',
    });
  };

  const resetTimer = () => {
    if (!isEnabled) return;

    clearAllTimers();

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarningDialog();
    }, warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);

    // logger.debug('🕐 Session timeout timer reset');
  };

  const handleActivity = () => {
    if (!isEnabled) return;
    
    // If warning is showing, dismiss it
    if (showWarning) {
      toast.dismiss('session-warning');
      setShowWarning(false);
    }
    
    // Debounce resetting the timer (optional, but good for performance)
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
        clearTimeout(warningRef.current);
    }
    resetTimer();
  };

  useEffect(() => {
    if (!isEnabled) {
      clearAllTimers();
      return;
    }

    // Initial timer setup
    resetTimer();

    // Activity event listeners
    // Removed 'mousedown' to reduce overhead, 'click' covers most interactions. 'mousemove' is too frequent.
    // 'keydown' covers typing. 'scroll' covers reading.
    const events = ['keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, true);
      });
      clearAllTimers();
    };
  }, [isEnabled, timeoutMinutes, warningMinutes]);

  return {
    enabled: isEnabled,
    resetTimer,
    showWarning,
    warningSeconds,
  };
};

/**
 * Save session timeout preference to localStorage
 */
export const setSessionTimeoutEnabled = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent('session-timeout-settings-changed'));
};

/**
 * Get session timeout preference from localStorage
 */
export const getSessionTimeoutEnabled = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) === 'true';
};
