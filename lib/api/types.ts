export type Treatment = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Therapist = {
  id: number;
  name: string;
  slug: string;
  title: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
  has_account: boolean;
  created_at: string;
  updated_at: string;
};
