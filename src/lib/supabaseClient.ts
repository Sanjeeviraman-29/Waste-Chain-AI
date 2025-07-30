import { createClient } from '@supabase/supabase-js';

// Live Supabase configuration
const supabaseUrl = 'https://jfkkjzawegcxhkzqdbva.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impma2tqemF3ZWdjeGhrenFkYnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMzc3OTUsImV4cCI6MjA2ODkxMzc5NX0.42iy-_RaD5nwAN9231K_LyGEjqN7qVXJKg2Ahazymo8';

// Create the Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for EPR system
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
          role: 'household' | 'collector' | 'company' | 'admin';
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
          role?: 'household' | 'collector' | 'company' | 'admin';
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
          role?: 'household' | 'collector' | 'company' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      pickups: {
        Row: {
          id: string;
          user_id: string;
          collector_id: string | null;
          waste_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          estimated_weight: number | null;
          actual_weight: number | null;
          status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
          pickup_address: string;
          pickup_coordinates: unknown | null;
          image_url: string | null;
          scheduled_date: string | null;
          collected_date: string | null;
          processed_date: string | null;
          completed_date: string | null;
          special_instructions: string | null;
          ai_verification_score: number | null;
          points_awarded: number;
          epr_credit_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collector_id?: string | null;
          waste_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
          pickup_address: string;
          pickup_coordinates?: unknown | null;
          image_url?: string | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          ai_verification_score?: number | null;
          points_awarded?: number;
          epr_credit_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collector_id?: string | null;
          waste_type?: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
          pickup_address?: string;
          pickup_coordinates?: unknown | null;
          image_url?: string | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          ai_verification_score?: number | null;
          points_awarded?: number;
          epr_credit_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      epr_credits: {
        Row: {
          id: string;
          credit_type: string;
          description: string;
          weight_kg: number;
          material_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          price: number;
          status: 'AVAILABLE' | 'SOLD' | 'RETIRED';
          company_id: string | null;
          pickup_id: string | null;
          certificate_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          credit_type: string;
          description: string;
          weight_kg: number;
          material_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          price: number;
          status?: 'AVAILABLE' | 'SOLD' | 'RETIRED';
          company_id?: string | null;
          pickup_id?: string | null;
          certificate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          credit_type?: string;
          description?: string;
          weight_kg?: number;
          material_type?: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
          price?: number;
          status?: 'AVAILABLE' | 'SOLD' | 'RETIRED';
          company_id?: string | null;
          pickup_id?: string | null;
          certificate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ledger_entries: {
        Row: {
          id: string;
          user_id: string;
          pickup_id: string | null;
          epr_credit_id: string | null;
          transaction_type: 'pickup_created' | 'pickup_completed' | 'credit_purchased' | 'credit_retired' | 'points_awarded';
          points_change: number | null;
          amount: number | null;
          balance_after: number | null;
          transaction_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pickup_id?: string | null;
          epr_credit_id?: string | null;
          transaction_type: 'pickup_created' | 'pickup_completed' | 'credit_purchased' | 'credit_retired' | 'points_awarded';
          points_change?: number | null;
          amount?: number | null;
          balance_after?: number | null;
          transaction_data?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pickup_id?: string | null;
          epr_credit_id?: string | null;
          transaction_type?: 'pickup_created' | 'pickup_completed' | 'credit_purchased' | 'credit_retired' | 'points_awarded';
          points_change?: number | null;
          amount?: number | null;
          balance_after?: number | null;
          transaction_data?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Helper functions for common operations
export const uploadImage = async (file: File, path: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from('waste-images')
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('waste-images')
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: error as Error };
  }
};

export const insertPickup = async (pickupData: Database['public']['Tables']['pickups']['Insert']) => {
  return await supabaseClient
    .from('pickups')
    .insert([pickupData])
    .select()
    .single();
};

export const getAvailableEPRCredits = async () => {
  return await supabaseClient
    .from('epr_credits')
    .select('*')
    .eq('status', 'AVAILABLE')
    .order('created_at', { ascending: false });
};

export const getCompanyCredits = async (companyId: string) => {
  return await supabaseClient
    .from('epr_credits')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'SOLD')
    .order('updated_at', { ascending: false });
};

export const getCreditDigitalTrail = async (creditId: string) => {
  const { data: credit } = await supabaseClient
    .from('epr_credits')
    .select(`
      *,
      pickups(*),
      ledger_entries(*)
    `)
    .eq('id', creditId)
    .single();

  return credit;
};

export const purchaseEPRCredit = async (creditId: string, companyId: string) => {
  const { data, error } = await supabaseClient.rpc('purchase_epr_credit', {
    credit_id: creditId,
    company_id: companyId
  });

  if (error) throw error;
  return data;
};
