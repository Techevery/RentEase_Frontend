import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRegisterMutation } from '../../redux/services/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

interface ApiError {
  data?: {
    message?: string;
  }
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
    role: 'landlord'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [register] = useRegisterMutation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      toast.error(newErrors.email);
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    
    }

   if (!formData.phonenumber.trim()) {
  newErrors.phonenumber = 'Phone number is required';
} 

    if (!formData.password) {
      newErrors.password = 'Password is required';
   
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
     
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const phoneNumber = parseInt(formData.phonenumber);
if (isNaN(phoneNumber)) {
  toast.error('Invalid phone number format');
  return;
}


      const { name, email, phonenumber, password, role } = formData;
      await register({ name, email, phonenumber, password, role }).unwrap();

      toast.success('Account created successfully');
      navigate(`/${role}/dashboard`);
    } catch (error) {
      const apiError = error as ApiError;
   
      const errorMessage = apiError.data?.message || 'Signup failed';
      if (errorMessage.includes('email')) {
        toast.error('Email already exists');
      } else if (errorMessage.includes('phonenumber')) {
        toast.error('Phone number already exists');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
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
            Create your account detailsss
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join RentEase to manage your properties efficiently
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.name}
              required
              icon={<User size={18} />}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              icon={<Mail size={18} />}
            />

           <Input
  id="phonenumber"
  name="phonenumber"
  type="tel"
  label="Phone Number"
  value={formData.phonenumber}
  onChange={handleChange}
  placeholder="+1234567890"
  error={errors.phonenumber}
  required
  icon={<Phone size={18} />}
/>

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required 
              icon={<Lock size={18} />}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
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
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="landlord">Landlord</option>
              </select>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-800 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;