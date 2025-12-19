import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/api';
import { Edit, Trash2, X, Mail, Shield, Eye, EyeOff } from 'lucide-react';

interface Member {
  user_id: string;
  role: string;
  role_assigned_at: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState<'email' | 'verification'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'employee' | 'admin'>('employee');
  const [adminPassword, setAdminPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Assign role modal states
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [assignRole, setAssignRole] = useState<'employee' | 'admin'>('employee');
  const [assignPassword, setAssignPassword] = useState('');
  const [assignOtp, setAssignOtp] = useState('');
  const [assignExpectedOtp, setAssignExpectedOtp] = useState('');
  const [assignOtpSent, setAssignOtpSent] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAssignPassword, setShowAssignPassword] = useState(false);
  const [assignOtpTimer, setAssignOtpTimer] = useState(0);

  useEffect(() => {
    fetchMembers();
  }, []);

  // OTP Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assignOtpTimer > 0) {
      interval = setInterval(() => {
        setAssignOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [assignOtpTimer]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_details')
        .select('*')
        .order('role_assigned_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async () => {
    if (otpTimer > 0) return; // Prevent sending if timer is active

    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }

    const otpCode = generateOTP();
    setExpectedOtp(otpCode);
    
    // In production, send OTP via email service
    // For now, showing in alert for demo purposes
    alert(`OTP sent to admin email: ${otpCode}\n\nNote: In production, this would be sent via email service.`);
    setOtpSent(true);
    setOtpTimer(60); // Start 60 second timer
  };

  const sendAssignOTP = async () => {
    if (assignOtpTimer > 0) return; // Prevent sending if timer is active

    const otpCode = generateOTP();
    setAssignExpectedOtp(otpCode);
    alert(`OTP sent to admin email: ${otpCode}\n\nNote: In production, this would be sent via email service.`);
    setAssignOtpSent(true);
    setAssignOtpTimer(60); // Start 60 second timer
  };

  const assignRoleToMember = async () => {
    if (!selectedUser || !assignPassword || !assignOtp) {
      alert('Please fill in all fields');
      return;
    }

    if (assignOtp !== assignExpectedOtp) {
      alert('Invalid OTP');
      return;
    }

    try {
      setAssigning(true);
      
      // First verify the admin's password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      // Verify password by attempting sign in with current user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email!,
        password: assignPassword,
      });

      if (signInError) {
        throw new Error('Invalid password');
      }

      // Password verified, now update the user's role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser.user_id,
          role: assignRole
        });

      if (roleError) {
        console.error('Error updating role:', roleError);
        throw new Error('Failed to update user role');
      }

      alert(`Role updated successfully! ${selectedUser.email} is now ${assignRole === 'admin' ? 'an admin' : 'an employee'}.`);
      setShowAssignRoleModal(false);
      setSelectedUser(null);
      setAssignRole('employee');
      setAssignPassword('');
      setAssignOtp('');
      setAssignExpectedOtp('');
      setAssignOtpSent(false);
      
      // Refresh the members list
      fetchMembers();
      
    } catch (err) {
      console.error('Error assigning role:', err);
      alert('Failed to assign role. Please check your password and try again.');
    } finally {
      setAssigning(false);
    }
  };

  const proceedToVerification = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setInviteStep('verification');
  };

  const goBackToEmail = () => {
    setInviteStep('email');
    setAdminPassword('');
    setOtp('');
    setExpectedOtp('');
    setOtpSent(false);
  };

  const verifyPasswordAndInvite = async () => {
    if (!inviteEmail || !adminPassword || !otp) {
      alert('Please fill in all fields');
      return;
    }

    if (otp !== expectedOtp) {
      alert('Invalid OTP');
      return;
    }

    try {
      setInviting(true);
      
      // First verify the admin's password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      // Verify password by attempting sign in with current user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email!,
        password: adminPassword,
      });

      if (signInError) {
        throw new Error('Invalid password');
      }

      // Password verified, now send invitation email via Supabase
      // This automatically sends an email invitation to the user
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
      
      if (error) throw error;

      // Add the user to user_roles table with selected role
      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: inviteRole
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          // Don't throw here as the invitation was successful
        }
      }

      alert(`Invitation email sent successfully to ${inviteEmail}!\n\nThey will receive an email with signup instructions.`);
      setShowInviteModal(false);
      setInviteStep('email');
      setInviteEmail('');
      setInviteRole('employee');
      setAdminPassword('');
      setOtp('');
      setExpectedOtp('');
      setOtpSent(false);
      
      // Refresh the members list
      fetchMembers();
      
    } catch (err) {
      console.error('Error inviting member:', err);
      alert('Failed to invite member. Please check your password and try again.');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Members</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Members</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">Manage your team members, assign roles, and oversee employee activities.</p>

        {/* Member list */}
        <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
        {members.length === 0 ? (
          <p className="text-gray-600">No members found.</p>
        ) : (
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-left p-3">Last Sign In</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.user_id} className="border-b">
                  <td className="p-3">{member.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      member.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-3">{new Date(member.user_created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {member.last_sign_in_at 
                      ? new Date(member.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit member"
                        onClick={() => {
                          setSelectedUser(member);
                          setAssignRole(member.role);
                          setShowAssignRoleModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Placeholder for actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Invite Member
          </button>
          <button 
            onClick={fetchMembers}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                {inviteStep === 'email' ? 'Invite New Member' : 'Security Verification'}
              </h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteStep('email');
                  setInviteEmail('');
                  setInviteRole('employee');
                  setAdminPassword('');
                  setOtp('');
                  setExpectedOtp('');
                  setOtpSent(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteStep === 'email' ? (
              // Step 1: Email Input
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid email address for the new team member
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'employee' | 'admin')}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      inviteRole === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inviteRole}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {inviteRole === 'admin' 
                      ? 'Admins have full access to manage members, view all data, and configure settings.'
                      : 'Employees can access assigned features but cannot manage other users or settings.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              // Step 2: Security Verification
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Inviting:</strong> {inviteEmail}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Role:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      inviteRole === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inviteRole}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Your Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your admin password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <button
                      onClick={sendOTP}
                      disabled={otpTimer > 0}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 whitespace-nowrap"
                    >
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="text-sm text-gray-600 mt-1">
                      Verification code sent to your admin email
                    </p>
                  )}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Email Invitation</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Once verified, an invitation email will be automatically sent to <strong>{inviteEmail}</strong> with signup instructions.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {inviteStep === 'email' ? (
                <>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedToVerification}
                    disabled={!inviteEmail || !inviteEmail.includes('@')}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={goBackToEmail}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyPasswordAndInvite}
                    disabled={inviting || !adminPassword || !otp}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {inviting ? 'Sending Invitation...' : 'Send Invitation'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Assign Role to Member
              </h3>
              <button 
                onClick={() => {
                  setShowAssignRoleModal(false);
                  setSelectedUser(null);
                  setAssignRole('employee');
                  setAssignPassword('');
                  setAssignOtp('');
                  setAssignExpectedOtp('');
                  setAssignOtpSent(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>User:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Current Role:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedUser.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Role
                </label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as 'employee' | 'admin')}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    assignRole === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {assignRole}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {assignRole === 'admin' 
                    ? 'Admins have full access to manage members, view all data, and configure settings.'
                    : 'Employees can access assigned features but cannot manage other users or settings.'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Your Password
                </label>
                <div className="relative">
                  <input
                    type={showAssignPassword ? "text" : "password"}
                    value={assignPassword}
                    onChange={(e) => setAssignPassword(e.target.value)}
                    className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your admin password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAssignPassword(!showAssignPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showAssignPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignOtp}
                    onChange={(e) => setAssignOtp(e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <button
                    onClick={sendAssignOTP}
                    disabled={assignOtpTimer > 0}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {assignOtpTimer > 0 ? `Resend in ${assignOtpTimer}s` : assignOtpSent ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {assignOtpSent && (
                  <p className="text-sm text-gray-600 mt-1">
                    Verification code sent to your admin email
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignRoleModal(false);
                  setSelectedUser(null);
                  setAssignRole('employee');
                  setAssignPassword('');
                  setAssignOtp('');
                  setAssignExpectedOtp('');
                  setAssignOtpSent(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={assignRoleToMember}
                disabled={assigning || !assignPassword || !assignOtp}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {assigning ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;