import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { stripeService } from '../services/stripeService';
import { getProductById } from '../stripe-config';

interface PurchaseSuccessPageProps {
  onBackToApp: () => void;
}

export const PurchaseSuccessPage: React.FC<PurchaseSuccessPageProps> = ({ onBackToApp }) => {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setProductName(product.name);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Purchase Successful!
            </h1>
            <p className="text-green-100">
              Thank you for your order
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Package className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Order Details</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium text-gray-900">
                    {productName || 'Premium Spice'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">$8.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2" />
                  <span>You'll receive an email confirmation shortly</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2" />
                  <span>Your order will be processed and shipped within 2-3 business days</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2" />
                  <span>Continue exploring and ranking spices in the app</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                <p className="text-sm text-gray-700">
                  Order confirmation will be sent to: <strong>{user.email}</strong>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onBackToApp}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <Star className="w-4 h-4 mr-2" />
                Continue Ranking Spices
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};