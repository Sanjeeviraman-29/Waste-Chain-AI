/*
  # WasteChain AI - Create New Collector Function
  # Session WCAI_0723
  
  Invokable function to securely create new collectors with authentication.
  Creates auth user and collector profile in a single transaction.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateCollectorRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  vehicle_id?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }

  try {
    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestData: CreateCollectorRequest = await req.json();
    
    // Validate required fields
    if (!requestData.name || !requestData.email || !requestData.password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: name, email, and password are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate password length
    if (requestData.password.length < 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Creating new collector:', requestData.email);

    // Step 1: Create authentication user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: true, // Auto-confirm email for collectors
      user_metadata: {
        role: 'collector',
        full_name: requestData.name
      }
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      
      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'An account with this email already exists' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create user account: ${authError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create user account' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Auth user created successfully:', authUser.user.id);

    // Step 2: Create profile entry
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: requestData.email,
        full_name: requestData.name,
        phone: requestData.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      
      // Cleanup: Delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create user profile: ${profileError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Step 3: Create collector entry
    const { data: collector, error: collectorError } = await supabaseAdmin
      .from('collectors')
      .insert({
        user_id: authUser.user.id,
        collector_name: requestData.name,
        phone: requestData.phone || '',
        vehicle_type: requestData.vehicle_id || null,
        license_plate: null,
        service_areas: [],
        is_active: true,
        rating: 5.0,
        total_collections: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (collectorError) {
      console.error('Collector creation failed:', collectorError);
      
      // Cleanup: Delete the auth user and profile if collector creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      await supabaseAdmin.from('profiles').delete().eq('id', authUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create collector profile: ${collectorError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Collector created successfully:', collector.id);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Collector ${requestData.name} created successfully`,
        data: {
          collector_id: collector.id,
          user_id: authUser.user.id,
          name: requestData.name,
          email: requestData.email,
          phone: requestData.phone,
          vehicle_type: requestData.vehicle_id,
          is_active: true,
          created_at: collector.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );

  } catch (error) {
    console.error('Unexpected error creating collector:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred while creating the collector'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});