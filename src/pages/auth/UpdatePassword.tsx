import React, { useState } from 'react';
import { useUpdatePasswordMutation } from '../../redux/services/authApi';
import Button from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

const UpdatePasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '', // ✅ FIXED: Changed from oldPassword to currentPassword
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false, // ✅ FIXED: Changed from old to current
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState('');
  
  const [updatePassword, { isLoading, isSuccess, isError, error }] = useUpdatePasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before submission:', formData);
    
    setPasswordError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      // ✅ FIXED: Send data directly without mapping
      const apiData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };
      
      console.log('Sending to API:', apiData);
      
      const result = await updatePassword(apiData).unwrap();
      
      console.log('API response:', result);
      
      // Reset form on success
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Update error:', err);
      
      // Enhanced error handling
      if (err.data?.message) {
        setPasswordError(err.data.message);
      } else if (err.status === 400) {
        setPasswordError('Current password is required');
      } else if (err.status === 401) {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Update Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword" // ✅ FIXED: Changed from oldPassword to currentPassword
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2 mt-1 pr-10"
              placeholder="Enter current password"
            />
            <span
              className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => toggleVisibility('current')} // ✅ FIXED: Changed from old to current
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border rounded px-3 py-2 mt-1 pr-10"
              placeholder="Enter new password"
            />
            <span
              className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => toggleVisibility('new')}
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border rounded px-3 py-2 mt-1 pr-10"
              placeholder="Confirm new password"
            />
            <span
              className="absolute right-3 top-[50%] -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => toggleVisibility('confirm')}
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}

        {isSuccess && (
          <p className="text-green-500 text-sm">
            Password updated successfully!
          </p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};

export default UpdatePasswordForm;