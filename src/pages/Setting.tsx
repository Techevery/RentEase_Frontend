
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import UpdatePasswordForm from '../pages/auth/UpdatePassword';
import UpdateProfileForm from '../pages/auth/UpdateUserProfile';

const Settings: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-10 space-y-8">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md border ${activeForm === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActiveForm('profile')}
          >
            Edit Profile
          </button>
          <button
            className={`px-4 py-2 rounded-md border ${activeForm === 'password' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setActiveForm('password')}
          >
            Change Password
          </button>
        </div>

        {activeForm === 'profile' && <UpdateProfileForm />}
        {activeForm === 'password' && <UpdatePasswordForm />}
      </div>
    </Layout>
  );
};

export default Settings;

