export interface SpiceBlend {
  id: string;
  name: string;
  spices: BlendSpice[];
  flavorProfile: string[];
  commonUses: string[];
  similarBlends: string[];
  createdAt: Date;
  userId?: string;
}

export interface BlendSpice {
  spice: {
    id: string;
    name: string;
    color: string;
    icon: string;
    flavorProfile: string[];
  };
  percentage: number;
}

export interface BlendSummary {
  flavorProfile: string[];
  commonUses: string[];
  similarBlends: string[];
}

export interface UserBlend {
  id: string;
  user_id: string;
  name: string;
  spices: BlendSpice[];
  flavor_profile: string[];
  common_uses: string[];
  similar_blends: string[];
  created_at: string;
  updated_at: string;
}