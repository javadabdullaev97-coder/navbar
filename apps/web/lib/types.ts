// Форма ответа RPC get_public_master (jsonb).
export interface PublicMaster {
  slug: string;
  name: string;
  specialization: string | null;
  category: string | null;
  bio: string | null;
  address: string | null;
  cover_color: string | null;
  org_id: string;
  master_id: string;
  rating: number;
  review_count: number;
  services: {
    id: string;
    name: string;
    duration_min: number;
    price: number;
  }[];
  availability: {
    day_of_week: number;
    start_min: number;
    end_min: number;
    is_day_off: boolean;
  }[];
  portfolio: { url: string; caption: string | null }[];
}

export interface BusyInterval {
  start_min: number;
  end_min: number;
}

export interface CatalogMaster {
  slug: string;
  name: string;
  specialization: string | null;
  category: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  min_price: number | null;
}

export interface Review {
  author_name: string;
  stars: number;
  text: string | null;
  created_at: string;
}
