import React, { useState } from 'react';
import { AlertTriangle, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from '../../api/api';
import toast from 'react-hot-toast';
import { logger } from "@/utils/logger";

interface ReportIssue {
  category: string;
  priority: string;
  subject: string;
  description: string;
}

const EmployeeSupport: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReportIssue>({
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'ui', label: 'UI/UX Problem' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low - Minor inconvenience' },
    { value: 'medium', label: 'Medium - Affects workflow' },
    { value: 'high', label: 'High - Major functionality issue' },
    { value: 'urgent', label: 'Urgent - System down/blocking work' }
  ];

  const handleInputChange = (field: keyof ReportIssue, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields', { id: 'employee-support-required' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to submit a report', { id: 'employee-support-auth' });
        return;
      }

      // Insert the report into the database
      const { error } = await supabase
        .from('employee_reports')
        .insert({
          employee_id: user.id,
          category: formData.category,
          priority: formData.priority,
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Report submitted successfully! Admin will review it soon.', { id: 'employee-report-submitted' });

      // Reset form
      setFormData({
        category: '',
        priority: 'medium',
        subject: '',
        description: ''
      });

    } catch (error) {
      logger.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.', { id: 'employee-report-failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Report System Issue</h1>
          <p className="text-gray-600">Report technical issues, bugs, or suggest improvements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Submit Report
              </CardTitle>
              <CardDescription>
                Please provide detailed information about the issue you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Textarea
                    id="subject"
                    placeholder="Brief summary of the issue..."
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="min-h-[60px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.subject.length}/200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the issue, steps to reproduce, expected vs actual behavior..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[120px]"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/2000 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Be Specific</p>
                  <p className="text-xs text-gray-600">Include steps to reproduce and expected behavior</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Use Correct Priority</p>
                  <p className="text-xs text-gray-600">Urgent for system-down issues, High for major problems</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Check Existing Reports</p>
                  <p className="text-xs text-gray-600">Avoid duplicate reports of known issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Urgent</span>
                <span className="text-sm font-medium text-red-600">Within 1 hour</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High</span>
                <span className="text-sm font-medium text-orange-600">Within 4 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium</span>
                <span className="text-sm font-medium text-yellow-600">Within 24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low</span>
                <span className="text-sm font-medium text-gray-600">Within 48 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSupport;