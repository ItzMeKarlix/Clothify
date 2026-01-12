import React, { useState } from 'react';
import { AlertTriangle, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { authService, supabase } from '@/api/api';
import { useNavigate } from 'react-router-dom';

interface OnboardingModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, userEmail, onClose }) => {
  const navigate = useNavigate();
  
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please provide a new password and confirm it');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user?.id) {
        toast.error('Session expired');
        return;
      }

      // Save username to auth metadata
      await supabase.auth.updateUser({
        data: { username: username.trim() }
      });

      // Update password
      await authService.updatePassword(newPassword);

      // Mark onboarding as complete
      await supabase
        .from('user_roles')
        .update({ onboarding_completed: true })
        .eq('user_id', session.data.session.user.id);

      toast.success('Account setup completed successfully!');
      
      // Redirect based on user role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.data.session.user.id)
        .single();

      if (userRole?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      console.error('Setup failed:', err);
      toast.error(err?.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (!showSetup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <h2 className="text-2xl font-bold">Welcome! Action Required</h2>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-gray-700">
              Welcome to <strong>Clothify</strong>! Your account has been created.
            </p>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important:</p>
              <p className="text-sm text-amber-800">
                You must <strong>complete your setup</strong> before you can fully access the system.
              </p>
              <p className="text-sm text-amber-800 mt-2">
                You'll need to set a username and password.
              </p>
            </div>

            {userEmail && (
              <p className="text-sm text-gray-600">
                <strong>Account Email:</strong> {userEmail}
              </p>
            )}
          </div>

          <Button 
            onClick={() => setShowSetup(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  // Setup Form Screen
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6 text-gray-700" />
          <h3 className="text-lg font-semibold">Complete Your Setup</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New password (min 8 characters)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSetup(false)}
              disabled={loading}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
