import React, { useState } from 'react';
import { X, Plus, Send, CheckCircle } from 'lucide-react';
import { missingSpiceService } from '../services/missingSpiceService';

interface MissingSpiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const MissingSpiceModal: React.FC<MissingSpiceModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [spiceName, setSpiceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('You must be logged in to submit missing spices.');
      return;
    }

    if (!spiceName.trim()) {
      setError('Please enter a spice name.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await missingSpiceService.submitMissingSpice(userId, spiceName.trim());
    
    if (result.success) {
      setSuccess(true);
      setSpiceName('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to submit spice request.');
    }

    setLoading(false);
  };

  const handleClose = () => {
    setSpiceName('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Submit Missing Spice
            </h2>
            <p className="text-gray-600 mt-2">
              Can't find a spice? Let us know and we'll consider adding it!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Submission Received!
                </h3>
                <p className="text-gray-600">
                  Thank you for your suggestion. We'll review it and consider adding it to our spice collection.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Spice Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spice Name
                </label>
                <input
                  type="text"
                  value={spiceName}
                  onChange={(e) => setSpiceName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter the missing spice name..."
                  required
                  maxLength={100}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {spiceName.length}/100 characters
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
                disabled={loading || !spiceName.trim()}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                  loading || !spiceName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Missing Spice
                  </>
                )}
              </button>

              {/* Info Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> We review all submissions and add popular spices to our collection. 
                  Duplicate submissions are automatically filtered out.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};