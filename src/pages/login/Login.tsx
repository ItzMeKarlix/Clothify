import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService, userService } from "../../api/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; 
import adminImg from "../../assets/admin-img.png";
import { sanitizeString, isValidEmail, isValidLength } from "../../utils/validation";

declare global {
  interface Window {
    turnstile: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load Cloudflare Turnstile
  useEffect(() => {
    if (window.turnstile) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  // Initialize Turnstile
  useEffect(() => {
    let checkTurnstile: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 50;

    const initializeTurnstile = () => {
      if (window.turnstile && document.getElementById("turnstile-container")) {
        clearInterval(checkTurnstile);
        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
        try {
          window.turnstile.render("#turnstile-container", { sitekey: siteKey, theme: "light", size: "normal" });
        } catch (err) {
          console.warn("Turnstile render error:", err);
        }
      } else if (attempts < maxAttempts) attempts++;
      else clearInterval(checkTurnstile);
    };

    checkTurnstile = setInterval(initializeTurnstile, 100);
    return () => clearInterval(checkTurnstile);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Input validation
      if (!email || !password) throw new Error("Please enter both email and password");
      if (!isValidEmail(email).valid) throw new Error("Please enter a valid email");
      if (!isValidLength(email, 255).valid) throw new Error("Email too long");
      if (!isValidLength(password, 255).valid) throw new Error("Password too long");

      const sanitizedEmail = sanitizeString(email);
      const sanitizedPassword = sanitizeString(password);

      // Turnstile check
      if (!window.turnstile) throw new Error("CAPTCHA not loaded");
      const token = window.turnstile.getResponse();
      if (!token) throw new Error("Please complete the CAPTCHA");

      // Supabase login
      const session = await authService.login(sanitizedEmail, sanitizedPassword);
      if (!session?.user?.id) throw new Error("Failed to login");

      // Check email confirmation
      if (!session.user.email_confirmed_at) {
        toast.error("Please confirm your email to continue.");
        try {
          await authService.resendConfirmationEmail(sanitizedEmail);
          toast.success("A confirmation email has been resent to your inbox.");
        } catch (err) {
          console.error("Resend confirmation error:", err);
          toast.error("Failed to resend confirmation email.");
        }
        return;
      }

      // Fetch user role
      const role = await userService.getUserRole(session.user.id);
      if (!role) throw new Error("No role assigned for this user");

      // Navigate based on role
      toast.success("Login successful!");
      if (role === "admin") navigate("/admin");
      else navigate("/employee-dashboard");

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login");
      toast.error(err.message || "Failed to login");
      window.turnstile?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 lg:py-0">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-15">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-black mb-2">Sign in</h2>
            <p className="text-gray-600 text-sm font-light">Admin or Employee Login to manage your store</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-black mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full border px-4 py-3 rounded"
                placeholder="example@email.com"
              />
            </div>

            <div className="relative">
              <label className="block text-xs text-black mb-2 font-medium">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full border px-4 py-3 rounded"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-[48px] -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div id="turnstile-container" className="flex justify-center my-6 scale-90 origin-top"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100 pt-6">
        <img src={adminImg} alt="Clothify" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

export default Login;
