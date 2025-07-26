import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (generated from schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          green_points: number;
          weekly_streak: number;
          total_pickups: number;
          last_pickup_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          green_points?: number;
          weekly_streak?: number;
          total_pickups?: number;
          last_pickup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          green_points?: number;
          weekly_streak?: number;
          total_pickups?: number;
          last_pickup_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pickups: {
        Row: {
          id: string;
          user_id: string;
          collector_id: string | null;
          waste_category: 'organic' | 'plastic' | 'paper' | 'electronic' | 'hazardous' | 'metal' | 'glass' | 'textile';
          estimated_weight: number | null;
          actual_weight: number | null;
          status: 'pending' | 'assigned' | 'in_progress' | 'collected' | 'processed' | 'completed' | 'cancelled';
          pickup_address: string;
          pickup_coordinates: unknown | null;
          scheduled_date: string | null;
          collected_date: string | null;
          processed_date: string | null;
          completed_date: string | null;
          special_instructions: string | null;
          image_urls: string[];
          ai_verification_score: number | null;
          points_awarded: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collector_id?: string | null;
          waste_category: 'organic' | 'plastic' | 'paper' | 'electronic' | 'hazardous' | 'metal' | 'glass' | 'textile';
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: 'pending' | 'assigned' | 'in_progress' | 'collected' | 'processed' | 'completed' | 'cancelled';
          pickup_address: string;
          pickup_coordinates?: unknown | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          image_urls?: string[];
          ai_verification_score?: number | null;
          points_awarded?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collector_id?: string | null;
          waste_category?: 'organic' | 'plastic' | 'paper' | 'electronic' | 'hazardous' | 'metal' | 'glass' | 'textile';
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: 'pending' | 'assigned' | 'in_progress' | 'collected' | 'processed' | 'completed' | 'cancelled';
          pickup_address?: string;
          pickup_coordinates?: unknown | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          image_urls?: string[];
          ai_verification_score?: number | null;
          points_awarded?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      collectors: {
        Row: {
          id: string;
          user_id: string | null;
          collector_name: string;
          phone: string;
          vehicle_type: string | null;
          license_plate: string | null;
          service_areas: string[];
          is_active: boolean;
          rating: number;
          total_collections: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          collector_name: string;
          phone: string;
          vehicle_type?: string | null;
          license_plate?: string | null;
          service_areas?: string[];
          is_active?: boolean;
          rating?: number;
          total_collections?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          collector_name?: string;
          phone?: string;
          vehicle_type?: string | null;
          license_plate?: string | null;
          service_areas?: string[];
          is_active?: boolean;
          rating?: number;
          total_collections?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          points_required: number;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
          points_required?: number;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
          points_required?: number;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      ledger_entries: {
        Row: {
          id: string;
          user_id: string;
          pickup_id: string | null;
          transaction_type: 'pickup_created' | 'pickup_completed' | 'badge_earned' | 'bonus_points' | 'penalty' | 'redemption';
          points_change: number;
          balance_after: number;
          transaction_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pickup_id?: string | null;
          transaction_type: 'pickup_created' | 'pickup_completed' | 'badge_earned' | 'bonus_points' | 'penalty' | 'redemption';
          points_change: number;
          balance_after: number;
          transaction_data?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pickup_id?: string | null;
          transaction_type?: 'pickup_created' | 'pickup_completed' | 'badge_earned' | 'bonus_points' | 'penalty' | 'redemption';
          points_change?: number;
          balance_after?: number;
          transaction_data?: Record<string, any>;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      pickup_status: 'pending' | 'assigned' | 'in_progress' | 'collected' | 'processed' | 'completed' | 'cancelled';
      waste_category: 'organic' | 'plastic' | 'paper' | 'electronic' | 'hazardous' | 'metal' | 'glass' | 'textile';
      transaction_type: 'pickup_created' | 'pickup_completed' | 'badge_earned' | 'bonus_points' | 'penalty' | 'redemption';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];