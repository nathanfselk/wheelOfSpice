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

export interface CommunityRating {
  spice_id: string;
  average_rating: number;
  total_ratings: number;
  rating_sum: number;
  updated_at: string;
}