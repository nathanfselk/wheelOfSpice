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

export interface MissingSpiceSubmission {
  id: string;
  user_id: string;
  spice_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}