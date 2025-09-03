// src/components/auth/UpdateProfileForm.tsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useUpdateUserMutation } from '../../redux/services/authApi';
import Button from '../../components/ui/Button';

const UpdateProfileForm: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateUser, { isLoading, isSuccess, isError, error }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonenumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phonenumber: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData).unwrap();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-4">Update Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full mt-1 border rounded px-3 py-2"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full mt-1 border rounded px-3 py-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            className="w-full mt-1 border rounded px-3 py-2"
            value={formData.phonenumber}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>

        {isError && (
          <p className="text-sm text-red-500 mt-2">
            {(error as any)?.data?.message || 'Update failed'}
          </p>
        )}
        {isSuccess && (
          <p className="text-sm text-green-600 mt-2">Profile updated successfully</p>
        )}
      </form>
    </div>
  );
};

export default UpdateProfileForm;
