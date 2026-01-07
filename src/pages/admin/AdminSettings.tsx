import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

    // Check if at least one field is being updated
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

      // Clear form
      setFormData({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });

      // If username changed, update session and redirect to login
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
        // If only password changed, just show success
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
      }
    } catch (error: any) {
      // Extract detailed error message from API response
      let errorTitle = "Update Failed";
      let errorMessage = "Failed to update credentials. Please try again.";
      
      // Check for specific error types
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Set specific titles based on error type
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
      
      // Show detailed error message
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Clear sensitive fields on error (except username)
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
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Update your username and password</p>
      </div>

      {/* Settings Form */}
      <div className="bg-card rounded-2xl card-shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Current Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                className={errors.currentPassword ? 'border-destructive' : ''}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              New Username (Optional)
            </label>
            <Input
              type="text"
              value={formData.newUsername}
              onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
              placeholder="Enter new username (leave empty to keep current)"
              className={errors.newUsername ? 'border-destructive' : ''}
            />
            {errors.newUsername && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newUsername}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              If changed, you'll need to login again with the new username
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              New Password (Optional)
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password (leave empty to keep current)"
                className={errors.newPassword ? 'border-destructive' : ''}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Confirm Password */}
          {formData.newPassword && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Current password is required to make any changes</li>
                  <li>You can update username, password, or both</li>
                  <li>If you change your username, you'll be logged out and need to login again</li>
                  <li>New password must be at least 6 characters long</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="accent-gradient text-accent-foreground font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
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
  );
};

export default AdminSettings;

