/*
  # WasteChain AI - On Pickup Created Function
  # Session WCAI_0723
  
  Triggered by database webhook when a new pickup is created.
  Simulates AI verification and awards initial points.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PickupCreatedPayload {
  type: 'INSERT';
  table: 'pickups';
  record: {
    id: string;
    user_id: string;
    waste_category: string;
    estimated_weight: number;
    image_urls: string[];
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: PickupCreatedPayload = await req.json();
    const pickup = payload.record;

    console.log('Processing new pickup:', pickup.id);

    // Simulate AI verification score (0.0 to 1.0)
    const aiScore = Math.random() * 0.4 + 0.6; // Between 0.6 and 1.0
    
    // Calculate initial points based on waste category and AI score
    const categoryPoints = {
      'organic': 10,
      'plastic': 15,
      'paper': 12,
      'electronic': 25,
      'hazardous': 30,
      'metal': 20,
      'glass': 15,
      'textile': 18
    };

    const basePoints = categoryPoints[pickup.waste_category as keyof typeof categoryPoints] || 10;
    const initialPoints = Math.round(basePoints * aiScore);

    // Update pickup with AI verification score and initial points
    const { error: updateError } = await supabaseClient
      .from('pickups')
      .update({
        ai_verification_score: aiScore,
        points_awarded: initialPoints
      })
      .eq('id', pickup.id);

    if (updateError) {
      throw updateError;
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('green_points')
      .eq('id', pickup.user_id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Create ledger entry for pickup creation
    const newBalance = (profile.green_points || 0) + initialPoints;
    
    const { error: ledgerError } = await supabaseClient
      .from('ledger_entries')
      .insert({
        user_id: pickup.user_id,
        pickup_id: pickup.id,
        transaction_type: 'pickup_created',
        points_change: initialPoints,
        balance_after: newBalance,
        transaction_data: {
          waste_category: pickup.waste_category,
          estimated_weight: pickup.estimated_weight,
          ai_score: aiScore,
          timestamp: new Date().toISOString()
        }
      });

    if (ledgerError) {
      throw ledgerError;
    }

    // Update user's green points
    const { error: pointsError } = await supabaseClient
      .from('profiles')
      .update({
        green_points: newBalance,
        total_pickups: supabaseClient.sql`total_pickups + 1`,
        last_pickup_date: new Date().toISOString()
      })
      .eq('id', pickup.user_id);

    if (pointsError) {
      throw pointsError;
    }

    // Check for first pickup badge
    const { data: existingBadge } = await supabaseClient
      .from('user_badges')
      .select('id')
      .eq('user_id', pickup.user_id)
      .limit(1)
      .single();

    if (!existingBadge) {
      // Award first pickup badge
      const { data: firstPickupBadge } = await supabaseClient
        .from('badges')
        .select('id')
        .eq('name', 'First Pickup')
        .single();

      if (firstPickupBadge) {
        await supabaseClient
          .from('user_badges')
          .insert({
            user_id: pickup.user_id,
            badge_id: firstPickupBadge.id
          });

        console.log('Awarded First Pickup badge to user:', pickup.user_id);
      }
    }

    console.log(`Pickup ${pickup.id} processed successfully. AI Score: ${aiScore.toFixed(2)}, Points: ${initialPoints}`);

    return new Response(
      JSON.stringify({
        success: true,
        pickup_id: pickup.id,
        ai_score: aiScore,
        points_awarded: initialPoints,
        new_balance: newBalance
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing pickup creation:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
