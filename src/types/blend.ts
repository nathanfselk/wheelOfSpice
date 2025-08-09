export interface SpiceBlend {
  id: string;
  name: string;
  spices: BlendSpice[];
  flavorProfile: string[];
  commonUses: string[];
  similarBlends: string[];
  createdAt: Date;
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