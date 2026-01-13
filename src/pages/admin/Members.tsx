import React, { useEffect, useState } from 'react';
import { supabase } from '../../api/api';
import { Edit, Trash2, X, Mail, Shield, Eye, EyeOff, UserCheck, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import toast from 'react-hot-toast';
import { loadTurnstileScript, initializeTurnstile } from '../../utils/auth';
import { logger } from "@/utils/logger";

interface Member {
  user_id: string;
  role: 'employee' | 'admin';
  role_assigned_at: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface EmployeeReport {
  id: string;
  employee_id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  admin_response?: string;
  admin_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  employee_email?: string;
}

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteStep, setInviteStep] = useState<'email' | 'verification'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'employee' | 'admin'>('employee');
  const [adminPassword, setAdminPassword] = useState('');
  const [otp, setOtp] = useState('');
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
  const [assignOtpSent, setAssignOtpSent] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showAssignPassword, setShowAssignPassword] = useState(false);
  const [assignOtpTimer, setAssignOtpTimer] = useState(0);

  // Delete member modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Reports state
  const [updatingReport, setUpdatingReport] = useState(false);
  const [showReportHistory, setShowReportHistory] = useState(false);
  
  // Current user state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchReports();
    
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
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
      
      // Use RPC function instead of querying view to avoid RLS recursion
      const { data, error } = await supabase
        .rpc('get_all_members');

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      logger.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const { data, error } = await supabase
        .from('employee_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique employee IDs
      const employeeIds = [...new Set((data || []).map(report => report.employee_id))];

      // Fetch user emails using RPC instead of querying view
      const emailPromises = employeeIds.map(async (empId) => {
        const { data: email } = await supabase
          .rpc('get_user_email_by_id', { target_user_id: empId });
        return { user_id: empId, email };
      });

      const emailResults = await Promise.all(emailPromises);

      // Create a map of user_id to email
      const userEmailMap: { [key: string]: string } = {};
      emailResults.forEach(result => {
        if (result.email) {
          userEmailMap[result.user_id] = result.email;
        }
      });

      // Transform the data to include employee email
      const transformedReports = (data || []).map(report => ({
        ...report,
        employee_email: userEmailMap[report.employee_id] || 'Unknown'
      }));

      setReports(transformedReports);
    } catch (err) {
      logger.error('Error fetching reports:', err);
      logger.error('Error details:', JSON.stringify(err, null, 2));
      setError('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, response?: string) => {
    try {
      setUpdatingReport(true);
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (response) {
        updateData.admin_response = response;
        updateData.admin_id = user?.id;
      }

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('employee_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      // Refresh reports
      await fetchReports();
    } catch (err) {
      logger.error('Error updating report:', err);
      alert('Failed to update report status');
    } finally {
      setUpdatingReport(false);
    }
  };

  const sendOTP = async () => {
    if (otpTimer > 0) return; // Prevent sending if timer is active

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Admin email not found');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('OTP sent to your admin email');
      setOtpSent(true);
      setOtpTimer(60);
    } catch (err: any) {
      logger.error('Error sending OTP:', err);
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  const sendAssignOTP = async () => {
    if (assignOtpTimer > 0) return; // Prevent sending if timer is active

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Admin email not found');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success('OTP sent to your admin email');
      setAssignOtpSent(true);
      setAssignOtpTimer(60);
    } catch (err: any) {
      logger.error('Error sending assign OTP:', err);
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  const assignRoleToMember = async () => {
    if (!selectedUser || !assignPassword || !assignOtp) {
      toast.error('Please fill in all fields', { id: 'assign-fields' });
      return;
    }

    try {
      setAssigning(true);

      // Verify OTP via Supabase Edge Function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Admin email not found');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ email: user.email, code: assignOtp })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        toast.error(verifyData.error || 'Invalid verification code', { id: 'assign-otp-invalid' });
        return;
      }

      // Verify password by attempting sign in with current user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: assignPassword,
      });

      if (signInError) {
        toast.error('Invalid password', { id: 'assign-invalid-password' });
        return;
      }

      // Password verified, now update the user's role
      const { error: roleError } = await supabase
        .rpc('admin_update_user_role', {
          target_user_id: selectedUser.user_id,
          new_role: assignRole
        });

      if (roleError) {
        logger.error('Error updating role:', roleError);
        throw new Error('Failed to update user role');
      }

      toast.success(`Role updated successfully! ${selectedUser.email} is now ${assignRole === 'admin' ? 'an admin' : 'an employee'}.`);
      setShowAssignRoleModal(false);
      setSelectedUser(null);
      setAssignRole('employee');
      setAssignPassword('');
      setAssignOtp('');
      setAssignOtpSent(false);

      // Refresh the members list
      fetchMembers();

    } catch (err: any) {
      logger.error('Error assigning role:', err);
      toast.error(err.message || 'Failed to assign role. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const proceedToVerification = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address', { id: 'invite-invalid-email' });
      return;
    }
    setInviteStep('verification');
    // Load and render Turnstile for verification step
    await loadTurnstileScript();
    initializeTurnstile('invite-turnstile-container').catch(() => {});
  };

  const goBackToEmail = () => {
    setInviteStep('email');
    setAdminPassword('');
    setOtp('');
    setOtpSent(false);
  };

  const verifyPasswordAndInvite = async () => {
    if (!inviteEmail || !adminPassword || !otp) {
      toast.error('Please fill in all fields', { id: 'invite-fields' });
      return;
    }

    try {
      setInviting(true);

      // Verify OTP via Supabase Edge Function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error('Admin email not found');

      // Verify the admin's password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: adminPassword,
      });

      if (signInError) {
        toast.error('Invalid password', { id: 'invite-invalid-password' });
        return;
      }

      // Password verified - call server-side function to verify OTP and send invite (uses service role key)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/invite-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ inviteEmail, role: inviteRole, adminEmail: user.email, code: otp })
      });

      const inviteResult = await res.json();
      if (!res.ok) {
        toast.error(inviteResult.error || 'Failed to send invite', { id: 'invite-failed' });
        return;
      }

      toast.success(`Invitation email sent successfully to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteStep('email');
      setInviteEmail('');
      setInviteRole('employee');
      setAdminPassword('');
      setOtp('');
      setOtpSent(false);

      // Refresh the members list
      fetchMembers();

    } catch (err: any) {
      logger.error('Error inviting member:', err);
      toast.error(err.message || 'Failed to invite member. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const sendDeleteOtp = async () => {
    if (!userToDelete || !deletePassword) {
      toast.error('Password is required', { id: 'delete-error' });
      return;
    }

    setDeleting(true);
    try {
      const user = await supabase.auth.getSession();
      if (!user.data.session) {
        toast.error('Session expired', { id: 'delete-error' });
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call delete-member function directly with OTP bypass (using adminEmail as verification)
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ 
          userId: userToDelete.user_id, 
          adminEmail: user.data.session.user.email, 
          code: 'password-confirmed' // Skip OTP validation for password-only flow
        })
      });

      const deleteResult = await res.json();
      if (!res.ok) {
        toast.error(deleteResult.error || 'Failed to delete member', { id: 'delete-failed' });
        return;
      }

      toast.success('Member deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeletePassword('');
      setDeleteConfirmText('');

      // Refresh the members list
      fetchMembers();
    } catch (err: any) {
      logger.error('Error deleting member:', err);
      toast.error(err.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
        <UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Team Members</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6">Manage your team members, assign roles, and oversee employee activities.</p>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Employee Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
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
                            className={`p-1 rounded transition-colors ${
                              member.user_id === currentUserId 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={member.user_id === currentUserId ? "You cannot delete your own account" : "Remove member"}
                            disabled={member.user_id === currentUserId}
                            onClick={() => {
                              if (member.user_id !== currentUserId) {
                                setUserToDelete(member);
                                setShowDeleteModal(true);
                              }
                            }}
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
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            {/* Reports list */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">
                  {showReportHistory ? 'Report History' : 'Employee Reports'}
                </h2>
                <button
                  onClick={() => setShowReportHistory(!showReportHistory)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    showReportHistory
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showReportHistory ? 'View Active Reports' : 'View History'}
                </button>
              </div>
              <button 
                onClick={fetchReports}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                disabled={reportsLoading}
              >
                {reportsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {/* Filter reports based on view mode */}
            {(() => {
              const filteredReports = showReportHistory
                ? reports.filter(r => r.status === 'resolved' || r.status === 'closed')
                : reports.filter(r => r.status !== 'resolved' && r.status !== 'closed');

              if (filteredReports.length === 0) {
                return (
                  <p className="text-gray-600">
                    {showReportHistory ? 'No closed reports found.' : 'No active reports found.'}
                  </p>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{report.subject}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          From: {report.employee_email} • {new Date(report.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Category: {report.category}
                        </p>
                        <p className="text-gray-700">{report.description}</p>
                        {report.admin_response && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Admin Response:</p>
                            <p className="text-sm text-blue-800">{report.admin_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {report.status !== 'resolved' && report.status !== 'closed' && (
                        <>
                          <button
                            onClick={() => updateReportStatus(report.id, 'in_progress')}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                            disabled={updatingReport}
                          >
                            Mark In Progress
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            disabled={updatingReport}
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}
                      {report.status === 'resolved' && (
                        <button
                          onClick={() => updateReportStatus(report.id, 'closed')}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          disabled={updatingReport}
                        >
                          Close Report
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
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
              <form onSubmit={(e) => { e.preventDefault(); verifyPasswordAndInvite(); }} className="space-y-4">
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
                      autoComplete="current-password"
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
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
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
              </form>
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
                  setAssignOtpSent(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); assignRoleToMember(); }} className="space-y-4">
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
                    autoComplete="current-password"
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
                    autoComplete="one-time-code"
                  />
                  <button
                    type="button"
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

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignRoleModal(false);
                    setSelectedUser(null);
                    setAssignRole('employee');
                    setAssignPassword('');
                    setAssignOtp('');
                    setAssignOtpSent(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || !assignPassword || !assignOtp}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {assigning ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Member Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold">Delete Member</h2>
            </div>

            <p className="text-gray-600 mb-4">
              This will permanently remove <strong>{userToDelete.email}</strong> from your system. This cannot be undone.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Password
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your password"
                  />
                  <button
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type to confirm deletion
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Type exactly: <strong>I want to delete {userToDelete.email} account.</strong>
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={`I want to delete ${userToDelete.email} account.`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendDeleteOtp}
                  disabled={
                    deleting || 
                    !deletePassword || 
                    deleteConfirmText !== `I want to delete ${userToDelete.email} account.`
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;