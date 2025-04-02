
export interface GreetingFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}

// Define an interface for the raw database response
export interface DbGreetingFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  duration_seconds?: number | null;
  created_at: string;
}
