// types/forum.ts

// Kategori Forum
export interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Thread Forum
export interface ForumThread {
  id: number;
  category_id: number;
  user_id: number;
  user: {
    name: string;
    role: string;
  }; // Embedded user info
  title: string;
  slug: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
}

// Post Forum
export interface ForumPost {
  id: number;
  thread_id: number;
  user_id: number;
  user: {
    name: string;
    role: string;
  }; // Embedded user info
  content: string;
  is_first_post: boolean;
  created_at: string;
  updated_at?: string;
}