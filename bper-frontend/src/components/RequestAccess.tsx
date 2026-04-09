import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from './ui/index';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
  });

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/bper/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      const { token, user } = response.data;

      if (!token) {
        toast.error('Registration failed: No token received');
        return;
      }

      // Auto login after registration
      login(token, user);
      toast.success('Registration successful! Welcome to BPER.');

      // Navigate to dashboard
      const redirectPath = user.role === 'admin' ? '/client-manager/dashboard' : '/bper/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);

      if (error.response?.status === 400) {
        if (message.includes('email')) {
          setError('email', { message });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pt-8 pb-6">
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
              Create Account
            </CardTitle>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Join QG Tools — BPER
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  id="name"
                  label="Full Name"
                  type="text"
                  placeholder="Enter your name"
                  error={errors.name?.message}
                  {...register('name')}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register('email')}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  error={errors.password?.message}
                  {...register('password')}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-widest">
                  Role
                </label>
                <select
                  {...register('role')}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185FA5] disabled:opacity-50"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.role.message}</p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-[#185FA5] hover:text-[#0f4a8a] transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
