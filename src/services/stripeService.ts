import { supabase } from '../lib/supabase';

export interface CartLineItem {
  price: string;
  quantity: number;
}

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface StripeOrder {
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
  shipping_address: any;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_cost: number;
}

export class StripeService {
  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    priceId: string,
    mode: 'payment' | 'subscription',
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId?: string; url?: string; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { error: 'Authentication required' };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to create checkout session' };
      }

      return { sessionId: result.sessionId, url: result.url };
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      return { error: error.message || 'Failed to create checkout session' };
    }
  }

  /**
   * Create a Stripe checkout session for multiple cart items
   */
  async createCartCheckoutSession(
    lineItems: CartLineItem[],
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId?: string; url?: string; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { error: 'Authentication required' };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line_items: lineItems,
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Failed to create checkout session' };
      }

      return { sessionId: result.sessionId, url: result.url };
    } catch (error: any) {
      console.error('Error creating cart checkout session:', error);
      return { error: error.message || 'Failed to create checkout session' };
    }
  }

  /**
   * Get user's subscription information
   */
  async getUserSubscription(): Promise<StripeSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error getting user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Get user's order history
   */
  async getUserOrders(): Promise<StripeOrder[]> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error getting user orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Check if user has purchased a specific product
   */
  async hasUserPurchasedProduct(priceId: string): Promise<boolean> {
    try {
      // Check for completed orders with this price
      const orders = await this.getUserOrders();
      const hasPurchased = orders.some(order => 
        order.payment_status === 'paid' && 
        order.order_status === 'completed'
      );

      if (hasPurchased) return true;

      // Check for active subscription with this price
      const subscription = await this.getUserSubscription();
      return subscription?.price_id === priceId && 
             subscription?.subscription_status === 'active';
    } catch (error) {
      console.error('Error checking product purchase:', error);
      return false;
    }
  }
}

export const stripeService = new StripeService();