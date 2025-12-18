import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { handlePasswordResetRequest } from "../../utils/auth";
import Layout from "../../layout/Layout";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await handlePasswordResetRequest(email);
      setSubmitted(true);
      toast.success("Reset link sent to your email!");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center">
            <div className="mb-12">
              <h1 className="text-3xl font-light text-black mb-2 tracking-wide">CLOTHIFY</h1>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Password Reset</p>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 mb-8 rounded">
              <p className="text-green-700 text-sm font-light">
                Check your email for a password reset link. Click the link to create a new password.
              </p>
            </div>

            <p className="text-xs text-gray-600 mb-6 font-light">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors font-light mb-4 rounded"
            >
              Try Another Email
            </button>

            <Link to="/login">
              <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-black px-6 py-3 text-sm uppercase tracking-wide transition-colors font-light rounded">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-black mb-2 tracking-wide">CLOTHIFY</h1>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Reset Password</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
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
                className="w-full border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black text-sm disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors rounded"
              />
            </div>

            <p className="text-xs text-gray-600 font-light">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm uppercase tracking-wide transition-colors font-light rounded"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center font-light">
              Remember your password?{" "}
              <Link to="/login" className="text-black hover:underline font-normal">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
