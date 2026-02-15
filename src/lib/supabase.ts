// Supabase stub - This file is kept for type definitions only
// The actual data operations use the file-based API in src/lib/api.ts

export const supabase = null as any;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  show_in_footer: boolean;
  created_at: string;
}

export interface Label {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category_id: string;
  label_id: string | null;
  featured_image: string | null;
  author: string;
  views: number;
  is_popular: boolean;
  published: boolean;
  featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_name: string;
  user_email: string;
  content: string;
  status: 'approved' | 'pending' | 'spam';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  reaction_type: 'love' | 'laugh' | 'wow' | 'think' | 'sad' | 'angry';
  user_identifier: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  show_in_menu: boolean;
  is_indexed: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaLibrary {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number;
  height: number;
  source: string;
  created_at: string;
}
