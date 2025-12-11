import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-light text-black mb-4 tracking-wider">404</h1>
        <h2 className="text-2xl font-light text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-600 font-light text-sm mb-8">
          The page you're looking for doesn't exist or is no longer accessible. You'll be redirected to the home page in 3 seconds.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 text-sm uppercase tracking-wide font-light border border-gray-300 text-black hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 text-sm uppercase tracking-wide font-light bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>

        <p className="text-gray-500 font-light text-xs mt-8">
          Redirecting automatically...
        </p>
      </div>
    </div>
  );
};

export default NotFound;
