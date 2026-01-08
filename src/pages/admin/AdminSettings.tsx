import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, Eye, EyeOff, AlertCircle, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (formData.newUsername && formData.newUsername.length < 3) {
      newErrors.newUsername = 'Username must be at least 3 characters';
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.confirmPassword && !formData.newPassword) {
      newErrors.confirmPassword = 'Please enter a new password first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!formData.newUsername && !formData.newPassword) {
      toast({
        title: "No Changes",
        description: "Please enter a new username or password to update",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authAPI.updateCredentials(
        formData.currentPassword,
        formData.newUsername || undefined,
        formData.newPassword || undefined
      );

      toast({
        title: "Success!",
        description: response.message || "Credentials updated successfully",
      });

      setFormData({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });

      if (formData.newUsername) {
        toast({
          title: "Username Changed",
          description: "Please login again with your new username",
        });
        setTimeout(() => {
          localStorage.removeItem('adminSession');
          navigate('/admin');
        }, 2000);
      } else {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
      }
    } catch (error: any) {
      let errorTitle = "Update Failed";
      let errorMessage = "Failed to update credentials. Please try again.";
      
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.toLowerCase().includes('current password')) {
        errorTitle = "Incorrect Current Password";
      } else if (errorMessage.toLowerCase().includes('username already exists')) {
        errorTitle = "Username Already Taken";
      } else if (errorMessage.toLowerCase().includes('password must be')) {
        errorTitle = "Invalid Password";
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        errorTitle = "Connection Error";
        errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (error.status === 401 || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('token')) {
        errorTitle = "Authentication Error";
        errorMessage = "Your session has expired. Please login again.";
      } else if (error.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "An error occurred on the server. Please try again later.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-500 text-sm">Update your username and password</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Security Settings</h2>
                <p className="text-xs text-gray-500">Manage your account credentials</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" />
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.currentPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'} focus:ring-2 ${errors.currentPassword ? 'focus:ring-red-200' : 'focus:ring-primary/20'} outline-none text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                New Username <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.newUsername}
                onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
                placeholder="Enter new username"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.newUsername ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'} focus:ring-2 ${errors.newUsername ? 'focus:ring-red-200' : 'focus:ring-primary/20'} outline-none text-sm`}
              />
              {errors.newUsername && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newUsername}
                </p>
              )}
              <p className="text-xs text-gray-500">Leave empty to keep current username</p>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" />
                New Password <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.newPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'} focus:ring-2 ${errors.newPassword ? 'focus:ring-red-200' : 'focus:ring-primary/20'} outline-none text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            {formData.newPassword && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'} focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-200' : 'focus:ring-primary/20'} outline-none text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
                    <li>Current password is required for any changes</li>
                    <li>You can update username, password, or both</li>
                    <li>Changing username will log you out</li>
                    <li>Password must be at least 6 characters</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Credentials
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
