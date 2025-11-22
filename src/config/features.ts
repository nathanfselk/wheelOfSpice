export interface FeatureFlags {
  enablePurchasing: boolean;
  enableCart: boolean;
  enableStripeCheckout: boolean;
  enableShippingAddresses: boolean;
}

export const featureFlags: FeatureFlags = {
  enablePurchasing: true, // Set to true to enable purchasing features
  enableCart: true,
  enableStripeCheckout: true,
  enableShippingAddresses: true
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