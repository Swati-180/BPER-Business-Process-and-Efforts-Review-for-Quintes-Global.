import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from './ui/index';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../validation/login';
import api from '../services/api';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/client-manager/dashboard' : '/bper/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Autofocus email field
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/api/auth/login', data);
      const { token, user } = response.data;

      if (!token) {
        toast.error('Login failed: No token received');
        return;
      }

      // Store and set auth
      login(token, user);
      toast.success('Logged in successfully!');

      // Navigate based on role
      const redirectPath = user.role === 'admin' ? '/client-manager/dashboard' : '/bper/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);

      // Set form-level errors
      if (error.response?.status === 401) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      } else if (error.response?.status >= 500) {
        setError('root', { message: 'Server error. Please try again later.' });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="w-16 h-16 bg-[#185FA5] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn size={32} />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
              QG Tools — BPER
            </CardTitle>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Sign in to your account
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register('email')}
                  className="transition-all duration-200 focus:scale-[1.02]"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password')}
                  className="pr-12 transition-all duration-200 focus:scale-[1.02]"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.root && (
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">{errors.root.message}</p>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                size="lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
                {!isSubmitting && <LogIn size={18} className="ml-2" />}
              </Button>

              <div className="text-center pt-4">
                <Link
                  to="/register"
                  className="text-sm font-semibold text-[#185FA5] hover:text-[#0f4a8a] transition-colors underline-offset-4 hover:underline"
                >
                  Create new account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
