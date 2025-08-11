export interface FeatureFlags {
  enablePurchasing: boolean;
  enableCart: boolean;
  enableStripeCheckout: boolean;
  enableShippingAddresses: boolean;
}

export const featureFlags: FeatureFlags = {
  enablePurchasing: false, // Set to true to enable purchasing features
  enableCart: false,
  enableStripeCheckout: false,
  enableShippingAddresses: false
};

// Helper function to check if purchasing is enabled
export const isPurchasingEnabled = (): boolean => {
  return featureFlags.enablePurchasing && 
         featureFlags.enableCart && 
         featureFlags.enableStripeCheckout;
};

// Helper function to check if shipping is enabled
export const isShippingEnabled = (): boolean => {
  return isPurchasingEnabled() && featureFlags.enableShippingAddresses;
};