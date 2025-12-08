import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/api";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

      await authService.login(email, password);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "Failed to login";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-black mb-2 tracking-wide">CLOTHIFY</h1>
          <p className="text-xs text-gray-600 uppercase tracking-wide">Admin Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm font-light">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-black mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-black mb-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors font-light"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center font-light">
            Return to{" "}
            <button
              onClick={() => navigate("/")}
              className="text-black hover:underline font-normal"
            >
              Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
