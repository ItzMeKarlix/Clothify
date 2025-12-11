import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/api";
import toast from "react-hot-toast";
import adminImg from "../../assets/admin-img.png";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Load reCAPTCHA script and hide badge
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Hide reCAPTCHA badge
    const style = document.createElement("style");
    style.innerHTML = `
      .grecaptcha-badge {
        visibility: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
    };
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

      // Generate reCAPTCHA token
      if (window.grecaptcha) {
        const token = await window.grecaptcha.execute("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", {
          action: "login",
        });
        setCaptchaToken(token);
        setShowCaptcha(true);
        setLoading(false);
        return;
      }

      // If reCAPTCHA not loaded, proceed without it
      await authService.login(email, password);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleCaptchaVerify = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!captchaToken) {
        setError("CAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }

      // Verify CAPTCHA token with backend
      const response = await fetch("/api/captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: captchaToken }),
      });

      const data = await response.json();

      if (!data.success) {
        setError("CAPTCHA verification failed. Please try again.");
        setShowCaptcha(false);
        setCaptchaToken(null);
        setLoading(false);
        return;
      }

      // Proceed with login
      await authService.login(email, password);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (err: any) {
      console.error("CAPTCHA verification error:", err);
      setError("CAPTCHA verification failed. Please try again.");
      setShowCaptcha(false);
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaCancel = () => {
    setShowCaptcha(false);
    setCaptchaToken(null);
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

          {/* CAPTCHA Modal */}
          {showCaptcha && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-xl">
                <h3 className="text-xl font-bold text-black mb-4">Verify You're Human</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This site is protected by reCAPTCHA and the Google{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  apply.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCaptchaCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-black px-4 py-2 text-sm font-medium transition-colors rounded disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCaptchaVerify}
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 text-sm font-medium transition-colors rounded disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </div>
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
                disabled={loading || showCaptcha}
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
                  disabled={loading || showCaptcha}
                  className="w-full border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || showCaptcha}
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

            <button
              type="submit"
              disabled={loading || showCaptcha}
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
