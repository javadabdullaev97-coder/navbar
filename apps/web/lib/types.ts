// Форма ответа RPC get_public_master (jsonb).
export interface PublicMaster {
  slug: string;
  name: string;
  specialization: string | null;
  bio: string | null;
  address: string | null;
  cover_color: string | null;
  org_id: string;
  master_id: string;
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
}

export interface BusyInterval {
  start_min: number;
  end_min: number;
}
