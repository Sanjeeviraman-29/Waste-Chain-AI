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

// Database types for EPR system - Aligned with standard Supabase patterns
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
          green_points: number | null;
          weekly_streak: number | null;
          total_pickups: number | null;
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
          green_points?: number | null;
          weekly_streak?: number | null;
          total_pickups?: number | null;
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
          green_points?: number | null;
          weekly_streak?: number | null;
          total_pickups?: number | null;
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
          type: string;
          estimated_weight: number | null;
          actual_weight: number | null;
          status: string;
          pickup_address: string;
          pickup_coordinates: unknown | null;
          image_url: string | null;
          scheduled_date: string | null;
          collected_date: string | null;
          processed_date: string | null;
          completed_date: string | null;
          special_instructions: string | null;
          ai_verification_score: number | null;
          points_awarded: number | null;
          epr_credit_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          collector_id?: string | null;
          type: string;
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: string;
          pickup_address: string;
          pickup_coordinates?: unknown | null;
          image_url?: string | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          ai_verification_score?: number | null;
          points_awarded?: number | null;
          epr_credit_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          collector_id?: string | null;
          type?: string;
          estimated_weight?: number | null;
          actual_weight?: number | null;
          status?: string;
          pickup_address?: string;
          pickup_coordinates?: unknown | null;
          image_url?: string | null;
          scheduled_date?: string | null;
          collected_date?: string | null;
          processed_date?: string | null;
          completed_date?: string | null;
          special_instructions?: string | null;
          ai_verification_score?: number | null;
          points_awarded?: number | null;
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
          material_type: string;
          price: number;
          status: string;
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
          material_type: string;
          price: number;
          status?: string;
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
          material_type?: string;
          price?: number;
          status?: string;
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
          transaction_type: string;
          points_change: number | null;
          amount: number | null;
          balance_after: number | null;
          transaction_data: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pickup_id?: string | null;
          epr_credit_id?: string | null;
          transaction_type: string;
          points_change?: number | null;
          amount?: number | null;
          balance_after?: number | null;
          transaction_data?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pickup_id?: string | null;
          epr_credit_id?: string | null;
          transaction_type?: string;
          points_change?: number | null;
          amount?: number | null;
          balance_after?: number | null;
          transaction_data?: Record<string, any> | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Helper functions for common operations with proper error handling
export const uploadImage = async (file: File, path: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    console.log('Uploading image to path:', path);
    
    const { data, error } = await supabaseClient.storage
      .from('waste-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    console.log('Upload successful, getting public URL for:', data.path);
    
    const { data: { publicUrl } } = supabaseClient.storage
      .from('waste-images')
      .getPublicUrl(data.path);

    console.log('Public URL generated:', publicUrl);
    
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload error details:');
    console.error('- Type:', typeof error);
    console.error('- Message:', error instanceof Error ? error.message : 'Unknown');
    console.error('- Full error:', error);
    return { url: null, error: error as Error };
  }
};

export const insertPickup = async (pickupData: Database['public']['Tables']['pickups']['Insert']) => {
  try {
    console.log('Inserting pickup with data:', pickupData);
    
    const result = await supabaseClient
      .from('pickups')
      .insert([pickupData])
      .select()
      .single();
    
    console.log('Pickup insertion result:', result);
    return result;
  } catch (error) {
    console.error('Pickup insertion failed:', error);
    throw error;
  }
};

export const getAvailableEPRCredits = async () => {
  try {
    return await supabaseClient
      .from('epr_credits')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });
  } catch (error) {
    console.error('Failed to fetch EPR credits:', error);
    throw error;
  }
};

export const getCompanyCredits = async (companyId: string) => {
  try {
    return await supabaseClient
      .from('epr_credits')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'SOLD')
      .order('updated_at', { ascending: false });
  } catch (error) {
    console.error('Failed to fetch company credits:', error);
    throw error;
  }
};

export const getCreditDigitalTrail = async (creditId: string) => {
  try {
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
  } catch (error) {
    console.error('Failed to fetch credit digital trail:', error);
    throw error;
  }
};

export const purchaseEPRCredit = async (creditId: string, companyId: string) => {
  try {
    const { data, error } = await supabaseClient.rpc('purchase_epr_credit', {
      credit_id: creditId,
      company_id: companyId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to purchase EPR credit:', error);
    throw error;
  }
};

// Schema validation function to test database connectivity
export const validateDatabaseSchema = async () => {
  try {
    console.log('🔍 Testing database schema alignment...');

    // Test profiles table structure
    const { data: profilesTest, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, created_at')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table test failed:', profilesError);
    } else {
      console.log('✅ Profiles table schema OK');
    }

    // Test pickups table structure
    const { data: pickupsTest, error: pickupsError } = await supabaseClient
      .from('pickups')
      .select('id, user_id, waste_type, image_url, status, created_at')
      .limit(1);

    if (pickupsError) {
      console.error('❌ Pickups table test failed:', pickupsError);
    } else {
      console.log('✅ Pickups table schema OK');
    }

    // Test epr_credits table structure
    const { data: creditsTest, error: creditsError } = await supabaseClient
      .from('epr_credits')
      .select('id, material_type, weight_kg, price, status, created_at')
      .limit(1);

    if (creditsError) {
      console.error('❌ EPR Credits table test failed:', creditsError);
    } else {
      console.log('✅ EPR Credits table schema OK');
    }

    // Test storage bucket access
    const { data: storageTest, error: storageError } = await supabaseClient.storage
      .from('waste-images')
      .list('', { limit: 1 });

    if (storageError) {
      console.error('❌ Storage bucket test failed:', storageError);
    } else {
      console.log('✅ Storage bucket access OK');
    }

    console.log('🎉 Schema validation complete!');

    return {
      profiles: !profilesError,
      pickups: !pickupsError,
      epr_credits: !creditsError,
      storage: !storageError
    };
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return null;
  }
};
