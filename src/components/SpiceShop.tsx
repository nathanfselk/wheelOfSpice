import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Package } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { stripeProducts } from '../stripe-config';
import { stripeService, StripeOrder } from '../services/stripeService';
import { ProductCard } from './ProductCard';
import { spices } from '../data/spices';

export const SpiceShop: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StripeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchaseData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load user's orders
        const userOrders = await stripeService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading purchase data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseData();
  }, [user]);

  const handlePurchaseSuccess = () => {
    // Reload purchase data after successful purchase
    if (user) {
      const loadPurchaseData = async () => {
        const userOrders = await stripeService.getUserOrders();
        setOrders(userOrders);
      };
      loadPurchaseData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8" itemScope itemType="https://schema.org/Store">
          <meta itemProp="name" content="Premium Spice Shop - Buy Quality Cooking Spices Online" />
          <meta itemProp="description" content="Shop premium cooking spices online. High-quality cinnamon, black pepper, and gourmet spices with fast shipping." />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Premium Spice Shop
          </h1>
          <p className="text-gray-600 mt-1">Buy the finest cooking spices online - Premium quality, fast shipping</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>Premium spices • Fast shipping • Quality guaranteed • Secure checkout</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stripeProducts.map((product) => {
            const spice = spices.find(s => s.name === product.name);
            return (
              <ProductCard
                key={product.id}
                product={product}
                spice={spice ? {
                  color: spice.color,
                  icon: spice.icon,
                  description: spice.description,
                  origin: spice.origin,
                  flavorProfile: spice.flavorProfile
                } : undefined}
                onPurchaseSuccess={handlePurchaseSuccess}
              />
            );
          })}
        </div>

        {/* Order History */}
        {user && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order History
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          Order #{order.order_id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(order.order_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ${(order.amount_total / 100).toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${
                          order.order_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipping Information */}
                    {order.shipping_address && (
                      <div className="border-t border-gray-200 pt-3">
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Shipping to:</strong> {order.shipping_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.shipping_address.line1}
                          {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}
                          <br />
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </div>
                        {order.shipping_phone && (
                          <div className="text-sm text-gray-600 mt-1">
                            Phone: {order.shipping_phone}
                          </div>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          Shipping: ${(order.shipping_cost / 100).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt for Anonymous Users */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In to Purchase</h3>
            <p className="text-gray-600 mb-4">Create an account or sign in to buy premium spices and track your orders</p>
          </div>
        )}
      </div>
    </div>
  );
};