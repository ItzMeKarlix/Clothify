/**
 * Authentication Utilities
 * Separated auth functions and logic
 */

import { authService } from "../api/api";
import toast from "react-hot-toast";
import { sanitizeString, isValidEmail, isValidLength } from "./validation";

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
      console.warn("Could not verify CAPTCHA, proceeding with login:", err);
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
    console.error("Auth session check error:", err);
    return false;
  }
};

/**
 * Load Cloudflare Turnstile script
 */
export const loadTurnstileScript = () => {
  return new Promise<void>((resolve) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.warn("Failed to load Turnstile script");
      resolve();
    };
    document.body.appendChild(script);
  });
};

/**
 * Initialize Turnstile widget
 */
export const initializeTurnstile = (containerId: string): Promise<void> => {
  return new Promise<void>((resolve) => {
    let attempts = 0;
    const maxAttempts = 50;

    const tryInit = () => {
      if (window.turnstile && document.getElementById(containerId)) {
        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
        try {
          window.turnstile.render(`#${containerId}`, {
            sitekey: siteKey,
            theme: "light",
            size: "normal",
          });
          resolve();
        } catch (err) {
          console.warn("Turnstile render error:", err);
          resolve();
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryInit, 100);
      } else {
        console.warn("Turnstile failed to load after 5 seconds");
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
