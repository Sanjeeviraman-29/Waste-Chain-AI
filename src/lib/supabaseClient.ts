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

    // If the error is about 'type' column not found, try with 'waste_type'
    if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes('type')) {

      console.log('Retrying with waste_type column...');
      try {
        // Convert 'type' to 'waste_type' and retry
        const fallbackData = { ...pickupData };
        if ('type' in fallbackData) {
          (fallbackData as any).waste_type = fallbackData.type;
          delete (fallbackData as any).type;
        }

        const retryResult = await supabaseClient
          .from('pickups')
          .insert([fallbackData])
          .select()
          .single();

        console.log('Pickup insertion succeeded with waste_type:', retryResult);
        return retryResult;
      } catch (retryError) {
        console.error('Retry with waste_type also failed:', retryError);
        throw retryError;
      }
    }

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

// Dynamic column detection cache
let detectedColumns: { [table: string]: string[] } = {};

// Detect actual column names in database tables
export const detectTableColumns = async (tableName: string): Promise<string[]> => {
  if (detectedColumns[tableName]) {
    return detectedColumns[tableName];
  }

  try {
    console.log(`🔍 Detecting columns in ${tableName} table...`);

    // Try to select all columns with limit 0 to get structure without data
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Failed to detect columns in ${tableName}:`, error);
      return [];
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`✅ Detected columns in ${tableName}:`, columns);
      detectedColumns[tableName] = columns;
      return columns;
    } else {
      // If no data, try common column patterns
      const commonColumns = await tryCommonColumns(tableName);
      detectedColumns[tableName] = commonColumns;
      return commonColumns;
    }
  } catch (error) {
    console.error(`❌ Error detecting columns in ${tableName}:`, error);
    return [];
  }
};

// Try common column name patterns
const tryCommonColumns = async (tableName: string): Promise<string[]> => {
  const commonPatterns: { [key: string]: string[][] } = {
    pickups: [
      ['id', 'user_id', 'type', 'status', 'created_at'],
      ['id', 'user_id', 'waste_type', 'status', 'created_at'],
      ['id', 'user_id', 'category', 'status', 'created_at'],
      ['id', 'user_id', 'kind', 'status', 'created_at'],
      ['id', 'user_id', 'material_type', 'status', 'created_at'],
      ['id', 'user_id', 'pickup_type', 'status', 'created_at']
    ],
    profiles: [
      ['id', 'email', 'full_name', 'created_at'],
      ['id', 'email', 'name', 'created_at']
    ],
    epr_credits: [
      ['id', 'material_type', 'price', 'status', 'created_at'],
      ['id', 'type', 'price', 'status', 'created_at']
    ]
  };

  const patterns = commonPatterns[tableName] || [['id', 'created_at']];

  for (const pattern of patterns) {
    try {
      const selectFields = pattern.join(', ');
      const { error } = await supabaseClient
        .from(tableName)
        .select(selectFields)
        .limit(1);

      if (!error) {
        console.log(`✅ Found working pattern for ${tableName}:`, pattern);
        return pattern;
      }
    } catch (e) {
      continue;
    }
  }

  console.log(`⚠️ No common patterns worked for ${tableName}`);
  return ['id', 'created_at']; // Minimal fallback
};

// Get the correct column name for waste type in pickups table
export const getWasteTypeColumn = async (): Promise<string> => {
  const columns = await detectTableColumns('pickups');

  // Check for various possible column names
  const possibleNames = ['type', 'waste_type', 'category', 'kind', 'material_type', 'pickup_type'];

  for (const name of possibleNames) {
    if (columns.includes(name)) {
      console.log(`✅ Found waste type column: ${name}`);
      return name;
    }
  }

  console.log('⚠️ No waste type column found, using "type" as fallback');
  return 'type'; // Fallback
};

// Schema validation function with dynamic detection
export const validateDatabaseSchema = async () => {
  try {
    console.log('🔍 Testing database schema with dynamic detection...');

    // Detect columns for each table
    const profileColumns = await detectTableColumns('profiles');
    const pickupColumns = await detectTableColumns('pickups');
    const creditColumns = await detectTableColumns('epr_credits');

    // Test storage bucket access
    const { data: storageTest, error: storageError } = await supabaseClient.storage
      .from('waste-images')
      .list('', { limit: 1 });

    if (storageError) {
      console.error('❌ Storage bucket test failed:', storageError);
    } else {
      console.log('✅ Storage bucket access OK');
    }

    console.log('🎉 Dynamic schema detection complete!');

    return {
      profiles: profileColumns.length > 0,
      pickups: pickupColumns.length > 0,
      epr_credits: creditColumns.length > 0,
      storage: !storageError,
      detectedColumns: {
        profiles: profileColumns,
        pickups: pickupColumns,
        epr_credits: creditColumns
      }
    };
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return null;
  }
};
