import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/api";
import toast from "react-hot-toast";
import adminImg from "../../assets/admin-img.png";

declare global {
  interface Window {
    turnstile: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Cloudflare Turnstile script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Turnstile widget in form
  useEffect(() => {
    const checkTurnstile = setInterval(() => {
      if (window.turnstile && document.getElementById("turnstile-container")) {
        clearInterval(checkTurnstile);
        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
        window.turnstile.render("#turnstile-container", {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
        });
      }
    }, 100);

    return () => clearInterval(checkTurnstile);
  }, []);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          navigate("/admin");
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      // Get Turnstile token
      if (!window.turnstile) {
        setError("CAPTCHA not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      const token = window.turnstile.getResponse();
      if (!token) {
        setError("Please complete the CAPTCHA verification");
        setLoading(false);
        return;
      }

      // Verify CAPTCHA token with backend
      const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/turnstile` : "/api/turnstile";
      
      try {
        const verifyResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!verifyResponse.ok) {
          console.warn("Turnstile verification endpoint not available, proceeding with login");
        } else {
          const verifyData = await verifyResponse.json();

          if (!verifyData.success) {
            setError("CAPTCHA verification failed. Please try again.");
            window.turnstile.reset();
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not verify CAPTCHA, proceeding with login:", err);
      }

      // Proceed with login
      await authService.login(email, password);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      toast.error(errorMessage);
      window.turnstile?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 lg:py-0">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-15">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-black mb-2">Sign in</h2>
            <p className="text-gray-600 text-sm font-light">
              Admin Login to manage your store
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-black mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors rounded"
              />
            </div>

            <div>
              <label className="block text-xs text-black mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="write your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Turnstile Widget */}
            <div id="turnstile-container" className="flex justify-center my-6 scale-90 origin-top"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm font-medium transition-colors rounded"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-gray-600 hover:text-black font-light"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100 pt-6">
        <img src={adminImg} alt="Clothify" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default Login;
