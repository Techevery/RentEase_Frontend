import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useForgotPasswordMutation } from '../../redux/services/authApi';

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [forgotPassword] = useForgotPasswordMutation();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword({ email }).unwrap();
      setSubmitted(true);
      toast.success(`Instructions sent to ${email}`);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMsg = apiError.data?.message || 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, forgotPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Building size={48} className="text-blue-800" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {submitted
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Email address"
                error={error}
                required
                icon={<Mail size={18} />}
                aria-invalid={!!error}
                aria-describedby={error ? 'email-error' : undefined}
              />
              {error && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            <div className="flex items-center justify-center">
              <Link
                to="/login"
                className="flex items-center text-sm text-blue-800 hover:text-blue-700"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
              >
                Resend Email
              </Button>

              <Link
                to="/login"
                className="flex items-center text-sm text-blue-800 hover:text-blue-700"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
