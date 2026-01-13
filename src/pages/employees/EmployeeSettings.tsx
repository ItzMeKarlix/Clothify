import React, { useEffect, useState, useMemo } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Save, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { authService, supabase, userService } from '../../api/api';
import toast from 'react-hot-toast';
import { useOnboarding } from '../../hooks/use-onboarding';
import OnboardingModal from '../../components/OnboardingModal';

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

const EmployeeSettings: React.FC = () => {
  const { needsOnboarding, userEmail } = useOnboarding();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Profile data state
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    role: 'employee'
  });

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const isPasswordValid = passwordStrength.strength >= 3; // At least "Fair" strength

  // Fetch employee profile data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          toast.error('Failed to load profile data');
          return;
        }

        // Fetch user role and name from user_roles table
        const { data: userProfile, error: roleError } = await supabase
          .rpc('get_user_profile');

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          toast.error('Failed to load profile information', { id: 'profile-load-error' });
          return;
        }

        setEmployeeData({
          name: userProfile?.[0]?.name || '',
          email: user.email || '',
          role: userProfile?.[0]?.role || 'employee'
        });
      } catch (err) {
        console.error('Error fetching employee data:', err);
        toast.error('Failed to load profile data', { id: 'profile-fetch-error' });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (!isPasswordValid) {
      toast.error(`Password is too weak. ${passwordStrength.feedback[0]}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user?.id) {
        toast.error('Session expired');
        return;
      }

      // Update the password using Supabase auth
      await authService.updatePassword(newPassword);

      // Mark onboarding as completed
      await completeOnboarding();

      toast.success('Password updated successfully!');
      
      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <OnboardingModal isOpen={needsOnboarding} userEmail={userEmail} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-sm">View and update your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {loadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-600 mt-2 text-sm">Loading profile...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-sm font-medium">Full Name</Label>
                  <Input id="full-name" disabled value={employeeData.name} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input id="email" type="email" disabled value={employeeData.email} className="w-full" />
                  <p className="text-xs text-muted-foreground">Contact your admin to change this</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Input 
                    id="role" 
                    disabled 
                    value={employeeData.role === 'employee' ? 'Employee' : employeeData.role.charAt(0).toUpperCase() + employeeData.role.slice(1)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Your role is managed by administrators</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-sm">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive emails for order updates</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Task Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified about assigned tasks</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">Show notifications in the app</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Security
            </CardTitle>
            <CardDescription className="text-sm">Manage security and access settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Session Timeout</Label>
                <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-bold">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm">New Password</Label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword || !isPasswordValid || newPassword !== confirmPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
            <CardDescription className="text-sm">View your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Account Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium">January 15, 2025</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Last Login</span>
              <span className="font-medium">Today at 2:30 PM</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium">Employee</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default EmployeeSettings;
