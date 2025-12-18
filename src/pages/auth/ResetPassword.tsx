import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { handlePasswordReset, checkAuthSession } from "../../utils/auth";
import Layout from "../../layout/Layout";
import { authService } from "../../api/api";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  // Check if user has valid session (from reset link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setSessionValid(true);
        } else {
          setError("Invalid or expired reset link. Please request a new one.");
          setTimeout(() => navigate("/forgot-password"), 3000);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("Invalid or expired reset link. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 3000);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await handlePasswordReset(password, confirmPassword);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reset password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 font-light text-sm">Verifying reset link...</p>
        </div>
      </Layout>
    );
  }

  if (!sessionValid) {
    return (
      <Layout>
        <div className="flex items-center justify-center px-6 py-20">
          <div className="max-w-md w-full text-center">
            <p className="text-red-600 font-light text-sm">
              {error || "Invalid or expired reset link"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-black mb-2 tracking-wide">CLOTHIFY</h1>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Create New Password</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm font-light">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-black mb-2 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 font-light mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-xs text-black mb-2 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors font-light rounded"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center font-light">
              Return to{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-black hover:underline font-normal"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
