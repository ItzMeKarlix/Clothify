import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface OnboardingModalProps {
  isOpen: boolean;
  userEmail?: string | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, userEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show modal on settings page
  if (!isOpen || location.pathname === '/admin/settings') {
    return null;
  }

  const handleGoToSettings = () => {
    navigate('/admin/settings?tab=security');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
          <h2 className="text-2xl font-bold">Welcome! Action Required</h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            Welcome to <strong>Clothify</strong>! Your admin account has been created.
          </p>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important:</p>
            <p className="text-sm text-amber-800">
              You must <strong>update your password</strong> in your account settings before you can fully access the system.
            </p>
            <p className="text-sm text-amber-800 mt-2">
              Without updating your password, you won't be able to sign in again.
            </p>
          </div>

          {userEmail && (
            <p className="text-sm text-gray-600">
              <strong>Account Email:</strong> {userEmail}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleGoToSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Settings & Update Password
          </Button>
          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to the Security section of your settings.
          </p>
        </div>
      </div>
    </div>
  );
};
