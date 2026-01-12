import React, { useState, useMemo } from 'react';
import { AlertTriangle, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { authService, supabase } from '@/api/api';
import { useNavigate } from 'react-router-dom';

// Password strength checker
const getPasswordStrength = (password: string) => {
  let strength = 0;
  const feedback: string[] = [];

  if (!password) return { strength: 0, feedback: ['Enter a password'], color: 'gray', label: 'None' };

  if (password.length >= 6) strength++;
  else feedback.push('At least 6 characters');

  if (password.length >= 8) strength++;
  else if (password.length >= 6) feedback.push('8+ characters recommended');

  if (/[a-z]/.test(password)) strength++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) strength++;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) strength++;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  else feedback.push('Add special characters');

  let color = 'red';
  let label = 'Weak';

  if (strength <= 2) {
    color = 'red';
    label = 'Weak';
  } else if (strength <= 4) {
    color = 'yellow';
    label = 'Fair';
  } else if (strength <= 5) {
    color = 'blue';
    label = 'Good';
  } else {
    color = 'green';
    label = 'Strong';
  }

  return { strength, feedback, color, label };
};

interface OnboardingModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, userEmail }) => {
  const navigate = useNavigate();
  
  const [showSetup, setShowSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const isPasswordValid = passwordStrength.strength >= 3; // At least "Fair" strength

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!isPasswordValid) {
      toast.error(`Password is too weak. ${passwordStrength.feedback[0]}`);
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

    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user?.id) {
        toast.error('Session expired');
        setLoading(false);
        return;
      }

      const userId = session.data.session.user.id;

      // Save username to user_roles table
      try {
        // First check if user exists in user_roles
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking user_roles:', checkError);
        }

        if (existingRole) {
          // Update existing user_roles record
          await supabase
            .from('user_roles')
            .update({ name: username.trim() })
            .eq('user_id', userId);
        } else {
          // Create new user_roles record with default role
          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              name: username.trim(),
              role: 'customer'
            });
        }
      } catch (usernameErr) {
        console.error('Error updating username:', usernameErr);
        toast.error('Failed to save username');
        setLoading(false);
        return;
      }

      // Update password
      try {
        await authService.updatePassword(newPassword);
      } catch (passwordErr: any) {
        console.error('Password update error:', passwordErr);
        toast.error(`Password update failed: ${passwordErr?.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      // Mark onboarding as complete
      try {
        await supabase
          .from('user_roles')
          .update({ onboarding_completed: true })
          .eq('user_id', userId);
      } catch (onboardingErr) {
        console.error('Error marking onboarding complete:', onboardingErr);
        // Continue even if this fails
      }

      toast.success('Account setup completed successfully!');
      
      // Small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh the page
      window.location.reload();
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

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm">Setting up your account...</p>
          </div>
        )}

        {!loading && (
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
                placeholder="New password (min 6 characters)"
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

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < passwordStrength.strength
                          ? passwordStrength.color === 'red'
                            ? 'bg-red-500'
                            : passwordStrength.color === 'yellow'
                            ? 'bg-yellow-500'
                            : passwordStrength.color === 'blue'
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === 'red'
                      ? 'text-red-600'
                      : passwordStrength.color === 'yellow'
                      ? 'text-yellow-600'
                      : passwordStrength.color === 'blue'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}>
                    Strength: {passwordStrength.label}
                  </span>
                </div>

                {/* Password Requirements */}
                {passwordStrength.feedback.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                    {passwordStrength.feedback.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isPasswordValid && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Password is strong enough!</span>
                  </div>
                )}
              </div>
            )}
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
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading || !username.trim() || !isPasswordValid || newPassword !== confirmPassword}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
