import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { rateLimitService } from '../services/rateLimitService';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');

  // Check if Supabase is configured
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Check Supabase configuration on mount
    import('../lib/supabase').then(({ isSupabaseConfigured }) => {
      setSupabaseConfigured(isSupabaseConfigured());
    });
  }, []);

  // Lock body scroll when modal is open
  useBodyScrollLock(isOpen);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    const hasNumberOrSpecial = /[0-9!@$%^&*]/.test(password);
    if (!hasNumberOrSpecial) {
      return 'Password must contain at least one number or special character (!, @, $, %, ^, &, *)';
    }
    
    return null;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const rateLimit = rateLimitService.checkRateLimit('passwordReset', resetEmail);
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many attempts. Please try again later.');
      return;
    }
    
    setResetLoading(true);
    setError('');

    try {
      // Record the attempt
      rateLimitService.recordAttempt('passwordReset', resetEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    if (!supabaseConfigured) {
      setError('Authentication service is not configured. Please check your environment variables.');
      return;
    }
    
    setError('');
    setRateLimitError('');
    
    // Check rate limit
    const action = isLogin ? 'login' : 'signup';
    const rateLimit = rateLimitService.checkRateLimit(action, email);
    if (!rateLimit.allowed) {
      setRateLimitError(rateLimit.message || 'Too many attempts. Please try again later.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Record the attempt
      rateLimitService.recordAttempt(action, email);
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= 3) {
            setError('Too many failed login attempts. Please reset your password.');
            setShowPasswordReset(true);
            setResetEmail(email);
          } else {
            // Provide user-friendly error messages
            let errorMessage = error.message;
            if (error.message.includes('Invalid login credentials')) {
              errorMessage = 'Invalid email or password';
            } else if (error.message.includes('Email not confirmed')) {
              errorMessage = 'Please check your email and click the confirmation link';
            }
            setError(`${errorMessage} (${newAttempts}/3 attempts)`);
          }
          setLoading(false);
          return;
        } else if (data.user) {
          console.log('Login successful for user:', data.user.email);
        }
      } else {
        // Validate password for signup
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        });
        
        if (error) {
          throw error;
        } else if (data.user) {
          console.log('Signup successful for user:', data.user.email);
          // Show success message for signup
          setError('Account created! Please check your email for verification.');
        }
      }

      onAuthSuccess();
      onClose();
      setEmail('');
      setPassword('');
      setLoginAttempts(0);
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setRateLimitError('');
    setShowPassword(false);
    setLoginAttempts(0);
    setShowPasswordReset(false);
    setResetEmail('');
    setResetSuccess(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  // Password Reset View
  if (showPasswordReset) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reset Your Password
              </h2>
              <p className="text-gray-600 mt-2">
                {resetSuccess 
                  ? 'Check your email for a password reset link'
                  : 'Enter your email to receive a password reset link'
                }
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {resetSuccess ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700">
                    We've sent a password reset link to <strong>{resetEmail}</strong>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    resetLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105'
                  }`}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setLoginAttempts(0);
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back!' : 'Join Wheel of Spice'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Sign in to access your spice rankings' 
                : 'Create an account to start ranking spices'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Supabase Configuration Warning */}
            {!supabaseConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-yellow-700 text-sm">
                  ⚠️ Authentication service is not properly configured. Please check your environment variables.
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters with a number or special character (!, @, $, %, ^, &, *)
                  </p>
                </div>
              )}
            </div>

            {/* Rate Limit Error */}
            {rateLimitError && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="text-orange-600 text-sm">{rateLimitError}</p>
                <p className="text-orange-500 text-xs mt-1">
                  Remaining attempts: {rateLimitService.getRemainingAttempts(isLogin ? 'login' : 'signup', email)}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
                {loginAttempts >= 3 && (
                  <button
                    onClick={() => {
                      setShowPasswordReset(true);
                      setResetEmail(email);
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors underline"
                  >
                    Reset Password
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !supabaseConfigured}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                loading || !supabaseConfigured
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105'
              }`}
            >
              {!supabaseConfigured 
                ? 'Service Unavailable'
                : loading 
                  ? 'Please wait...' 
                  : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={switchMode}
                className="ml-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};