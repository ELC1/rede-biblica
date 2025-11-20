export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  verse_reference?: string;
  verse_text?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: Profile;
  user_has_liked?: boolean;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  created_at: string;
  user_is_member?: boolean;
}
