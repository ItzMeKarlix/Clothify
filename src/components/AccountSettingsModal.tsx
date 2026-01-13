import React, { useState, useEffect, useMemo } from 'react';
import { User, Mail, Shield, Key, Bell, Save, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/api/api';
import toast from 'react-hot-toast';

// Password strength checker (same as OnboardingModal)
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

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'employee';
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, userRole }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    taskNotifications: userRole === 'employee',
    marketingEmails: userRole === 'admin',
  });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.newPassword), [formData.newPassword]);
  const isPasswordValid = passwordStrength.strength >= 3; // At least "Fair" strength

  useEffect(() => {
    if (isOpen) {
      const getUser = async () => {
        try {
          setLoading(true);
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          if (user) {
            setUser(user);

            // Get user profile data using RPC to avoid RLS recursion
            const { data: userProfile, error: roleError } = await supabase
              .rpc('get_user_profile');

            if (roleError) {
              console.error('❌ Error fetching user profile:', roleError);
              toast.error('Error loading profile data.', { id: 'account-db-error' });
            }

            setFormData(prev => ({
              ...prev,
              email: user.email || '',
              name: userProfile?.name || '',
            }));

            // Store the original name for change detection
            setOriginalName(userProfile?.name || '');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error('Failed to load user information', { id: 'account-load-failed' });
        } finally {
          setLoading(false);
        }
      };
      getUser();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateEmail = async () => {
    if (!formData.email || formData.email === user?.email) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: formData.email });
      if (error) throw error;
      toast.success('Email update initiated. Please check your email to confirm the change.', { id: 'account-email-update' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email', { id: 'account-email-update-failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async () => {
    console.log('🔄 handleUpdateName called with name:', formData.name);
    console.log('👤 Current user:', user);

    if (!formData.name.trim()) {
      console.log('❌ Name is empty');
      toast.error('Name cannot be empty', { id: 'account-name-empty' });
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID');
      toast.error('User not authenticated', { id: 'account-not-authenticated' });
      return;
    }

    setSaving(true);
    console.log('📝 Starting name update...');

    try {
      console.log('🔍 Updating user name via RPC...');
      
      // Use RPC function to avoid RLS recursion
      const { error } = await supabase.rpc('update_user_name', {
        new_name: formData.name.trim()
      });

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ Name update successful');
      toast.success('Name updated successfully', { id: 'account-name-updated' });

      // Update the original name so the button becomes disabled again
      setOriginalName(formData.name.trim());
    } catch (error: any) {
      console.error('❌ Failed to update name:', error);
      toast.error(error.message || 'Failed to update name', { id: 'account-name-update-failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields', { id: 'account-password-fields' });
      return;
    }

    if (!isPasswordValid) {
      toast.error(`Password is too weak. ${passwordStrength.feedback[0]}`, { id: 'account-password-weak' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match', { id: 'account-password-mismatch' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.newPassword });
      if (error) throw error;

      toast.success('Password updated successfully', { id: 'account-password-updated' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password', { id: 'account-password-update-failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      name: originalName,
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      emailNotifications: true,
      taskNotifications: userRole === 'employee',
      marketingEmails: userRole === 'admin',
    });
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading account information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account details, security settings, and notification preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your display name"
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    console.log('🖱️ Name save button clicked');
                    handleUpdateName();
                  }}
                  disabled={saving || !formData.name.trim() || formData.name.trim() === originalName.trim()}
                  variant="outline"
                  size="sm"
                >
                  {saving ? 'Saving...' : <Save className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This name will be displayed in the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1"
                  disabled={userRole === 'employee'}
                />
                <Button
                  onClick={handleUpdateEmail}
                  disabled={saving || formData.email === user?.email || userRole === 'employee'}
                  variant="outline"
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {user?.email}
                {userRole === 'employee' && ' (Contact your admin to change)'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Input
                id="role"
                value={userRole === 'admin' ? 'Administrator' : 'Employee'}
                disabled
                className="bg-muted"
              />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.newPassword && (
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleUpdatePassword}
              disabled={
                saving || 
                !formData.currentPassword || 
                !formData.newPassword || 
                !formData.confirmPassword ||
                !isPasswordValid ||
                formData.newPassword !== formData.confirmPassword
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications about account activity and updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>

            {userRole === 'employee' && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="task-notifications">Task Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications about assigned tasks and customer support tickets
                    </p>
                  </div>
                  <Switch
                    id="task-notifications"
                    checked={formData.taskNotifications}
                    onCheckedChange={(checked) => handleInputChange('taskNotifications', checked)}
                  />
                </div>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive promotional emails and product updates
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={formData.marketingEmails}
                    onCheckedChange={(checked) => handleInputChange('marketingEmails', checked)}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsModal;