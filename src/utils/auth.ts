/**
 * Authentication Utilities
 * Separated auth functions and logic
 */

import { authService } from "../api/api";
import toast from "react-hot-toast";
import { sanitizeString, isValidEmail, isValidLength } from "./validation";
import { logger } from "./logger";

/**
 * Handle login with email and password
 */
export const handleAuthLogin = async (
  email: string,
  password: string,
  captchaToken?: string
) => {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (!isValidLength(password, 6, 128)) {
    throw new Error("Password must be between 6 and 128 characters");
  }

  // Sanitize inputs
  const sanitizedEmail = sanitizeString(email);
  const sanitizedPassword = sanitizeString(password);

  // Verify CAPTCHA if provided
  if (captchaToken) {
    try {
      const response = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: captchaToken }),
      });

      if (!response.ok) {
        throw new Error("CAPTCHA verification failed");
      }
    } catch (err) {
      logger.warn("Could not verify CAPTCHA, proceeding with login:", err);
    }
  }

  // Proceed with login
  await authService.login(sanitizedEmail, sanitizedPassword);
  return true;
};

/**
 * Handle password reset request
 */
export const handlePasswordResetRequest = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  const sanitizedEmail = sanitizeString(email);
  await authService.resetPasswordForEmail(sanitizedEmail);
  return true;
};

/**
 * Handle password reset with new password
 */
export const handlePasswordReset = async (password: string, confirmPassword: string) => {
  if (!password || !confirmPassword) {
    throw new Error("Both password fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const sanitizedPassword = sanitizeString(password);
  await authService.updatePassword(sanitizedPassword);
  return true;
};

/**
 * Check if user has valid auth session
 */
export const checkAuthSession = async () => {
  try {
    const session = await authService.getCurrentSession();
    return !!session;
  } catch (err) {
    logger.error("Auth session check error:", err);
    return false;
  }
};

/**
 * Load Cloudflare Turnstile script (idempotent)
 * Ensures the script is only injected once and returns a shared Promise for concurrent callers
 */
let turnstileLoadPromise: Promise<void> | null = null;
export const loadTurnstileScript = (): Promise<void> => {
  const src = "https://challenges.cloudflare.com/turnstile/v0/api.js";

  // If Turnstile is already available, resolve immediately
  if ((window as any).turnstile) return Promise.resolve();

  // Reuse existing in-flight promise
  if (turnstileLoadPromise) return turnstileLoadPromise;

  // If a script tag already exists on the page, wait for its load event
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;

  turnstileLoadPromise = new Promise<void>((resolve) => {
    if ((window as any).turnstile) {
      resolve();
      return;
    }

    if (existing) {
      if (existing.getAttribute("data-loaded") === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.setAttribute("data-loaded", "1");
        resolve();
      });
      existing.addEventListener("error", () => {
        logger.warn("Failed to load Turnstile script");
        resolve();
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.setAttribute("data-loaded", "1");
      resolve();
    };
    script.onerror = () => {
      logger.warn("Failed to load Turnstile script");
      resolve();
    };
    document.body.appendChild(script);
  });

  return turnstileLoadPromise;
};

/**
 * Initialize Turnstile widget (waits for loader)
 */
export const initializeTurnstile = async (containerId: string): Promise<void> => {
  await loadTurnstileScript();

  return new Promise<void>((resolve) => {
    let attempts = 0;
    const maxAttempts = 50;

    const tryInit = () => {
      if ((window as any).turnstile && document.getElementById(containerId)) {
        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
        try {
          window.turnstile.render(`#${containerId}`, {
            sitekey: siteKey,
            theme: "light",
            size: "normal",
          });
        } catch (err) {
          logger.warn("Turnstile render error:", err);
        }
        resolve();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryInit, 100);
      } else {
        logger.warn("Turnstile failed to initialize after 5 seconds");
        resolve();
      }
    };

    tryInit();
  });
};

declare global {
  interface Window {
    turnstile: any;
  }
}
