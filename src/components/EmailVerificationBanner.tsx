import React, { useState, useEffect } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { emailVerificationService } from '../services/emailVerificationService';

interface EmailVerificationBannerProps {
  userEmail?: string;
  onDismiss?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  userEmail,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!userEmail) return;
      
      const status = await emailVerificationService.getVerificationStatus();
      setIsVisible(status.needsVerification);
    };

    checkVerificationStatus();
  }, [userEmail]);

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setIsResending(true);
    setError('');
    setResendSuccess(false);

    const result = await emailVerificationService.sendVerificationEmail(userEmail);
    
    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setError(result.error || 'Failed to send verification email');
    }

    setIsResending(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Verify Your Email Address
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Please check your email ({userEmail}) and click the verification link to activate your account.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-sm text-green-600">Verification email sent successfully!</p>
              </div>
            )}

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isResending
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-1" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};