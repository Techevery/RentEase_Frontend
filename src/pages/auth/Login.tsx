import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Mail, Lock } from 'lucide-react';
import { useLoginMutation } from '../../redux/services/authApi';
import { toast } from 'react-toastify';
import { z } from 'zod';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useFormValidation } from '../../../hook/useFormValidation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
  status?: number;
}

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['landlord', 'manager'])
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    values,
    errors,
    handleChange,
  } = useFormValidation(loginSchema, { email: '', password: '', role: 'landlord' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(values).unwrap();
      localStorage.setItem("user", JSON.stringify(userData.user));

      // Save user and token to Redux
      dispatch(setCredentials({
        user: userData.user,   // Must include `role` field
        token: userData.token,
      }));

      // Display success message
      toast.success('Login successful');

      // Navigate to the appropriate dashboard after a delay
      setTimeout(() => {
        navigateToDashboard(userData.user.role);
      }, 3000);

    } catch (error) {
      const apiError = error as ApiError;
      const message = apiError?.data?.message || apiError?.data?.error || 'Login failed';

      // Display error message
      toast.error(message);
    }
  };

  const navigateToDashboard = (role: string) => {
    switch (role) {
      case 'landlord':
        navigate('/landlord/dashboard');
        break;
      case 'manager':
        navigate('/manager/dashboard');
        break;
      default:
        toast.error('Invalid role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Building size={48} className="text-blue-800" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            RentEase
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={values.email}
              onChange={handleChange('email')}
              placeholder="Email address"
              error={errors.email}
              required
              icon={<Mail size={18} />}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={values.password}
              onChange={handleChange('password')}
              placeholder="Password"
              error={errors.password}
              required
              icon={<Lock size={18} />}
            />

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={handleChange('role')}
                className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="landlord">Landlord</option>
                <option value="manager">Manager</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-800 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-800 hover:text-blue-700">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-800 hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="group relative"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;