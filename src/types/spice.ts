export interface Spice {
  id: string;
  name: string;
  origin: string;
  flavorProfile: string[];
  commonUses: string[];
  averageRating: number;
  description: string;
  color: string;
  icon: string;
}

export interface UserRanking {
  spice: Spice;
  rating: number;
  rankedAt: Date;
}