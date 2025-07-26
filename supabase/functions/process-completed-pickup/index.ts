/*
  # WasteChain AI - Process Completed Pickup Function
  # Session WCAI_0723
  
  Triggered by database webhook when a pickup is marked as completed.
  Awards final points, checks for new badges, and creates immutable ledger entry.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PickupCompletedPayload {
  type: 'UPDATE';
  table: 'pickups';
  record: {
    id: string;
    user_id: string;
    waste_category: string;
    actual_weight: number;
    status: string;
    points_awarded: number;
  };
  old_record: {
    status: string;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: PickupCompletedPayload = await req.json();
    const pickup = payload.record;
    const oldRecord = payload.old_record;

    // Only process if status changed to 'completed'
    if (pickup.status !== 'completed' || oldRecord.status === 'completed') {
      return new Response(
        JSON.stringify({ success: true, message: 'No processing needed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing completed pickup:', pickup.id);

    // Calculate bonus points based on actual weight
    const weightBonus = pickup.actual_weight ? Math.round(pickup.actual_weight * 2) : 0;
    const finalPoints = pickup.points_awarded + weightBonus;

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', pickup.user_id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const newBalance = (profile.green_points || 0) + weightBonus;

    // Create final ledger entry
    const { error: ledgerError } = await supabaseClient
      .from('ledger_entries')
      .insert({
        user_id: pickup.user_id,
        pickup_id: pickup.id,
        transaction_type: 'pickup_completed',
        points_change: weightBonus,
        balance_after: newBalance,
        transaction_data: {
          waste_category: pickup.waste_category,
          actual_weight: pickup.actual_weight,
          weight_bonus: weightBonus,
          completion_timestamp: new Date().toISOString()
        }
      });

    if (ledgerError) {
      throw ledgerError;
    }

    // Update user's green points and streak
    const lastPickupDate = profile.last_pickup_date ? new Date(profile.last_pickup_date) : null;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = profile.weekly_streak || 0;
    
    // Check if this continues the streak
    if (lastPickupDate) {
      const daysDiff = Math.floor((today.getTime() - lastPickupDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1;
    }

    const { error: pointsError } = await supabaseClient
      .from('profiles')
      .update({
        green_points: newBalance,
        weekly_streak: newStreak,
        last_pickup_date: new Date().toISOString()
      })
      .eq('id', pickup.user_id);

    if (pointsError) {
      throw pointsError;
    }

    // Check for milestone badges
    const totalPickups = profile.total_pickups || 0;
    const badgesToCheck = [];

    if (totalPickups >= 10) badgesToCheck.push('Eco Warrior');
    if (totalPickups >= 50) badgesToCheck.push('Green Champion');
    if (totalPickups >= 100) badgesToCheck.push('Recycling Master');
    if (newStreak >= 7) badgesToCheck.push('Weekly Streak');

    // Category-specific badges
    const { data: categoryPickups } = await supabaseClient
      .from('pickups')
      .select('waste_category, actual_weight')
      .eq('user_id', pickup.user_id)
      .eq('status', 'completed');

    if (categoryPickups) {
      const plasticWeight = categoryPickups
        .filter(p => p.waste_category === 'plastic')
        .reduce((sum, p) => sum + (p.actual_weight || 0), 0);
      
      const paperWeight = categoryPickups
        .filter(p => p.waste_category === 'paper')
        .reduce((sum, p) => sum + (p.actual_weight || 0), 0);
      
      const electronicCount = categoryPickups
        .filter(p => p.waste_category === 'electronic').length;

      if (plasticWeight >= 50) badgesToCheck.push('Plastic Fighter');
      if (paperWeight >= 100) badgesToCheck.push('Paper Saver');
      if (electronicCount >= 20) badgesToCheck.push('E-Waste Expert');
    }

    // Award new badges
    for (const badgeName of badgesToCheck) {
      const { data: badge } = await supabaseClient
        .from('badges')
        .select('id')
        .eq('name', badgeName)
        .single();

      if (badge) {
        const { data: existingUserBadge } = await supabaseClient
          .from('user_badges')
          .select('id')
          .eq('user_id', pickup.user_id)
          .eq('badge_id', badge.id)
          .single();

        if (!existingUserBadge) {
          await supabaseClient
            .from('user_badges')
            .insert({
              user_id: pickup.user_id,
              badge_id: badge.id
            });

          // Award bonus points for badge
          const badgeBonus = 50;
          const badgeBalance = newBalance + badgeBonus;

          await supabaseClient
            .from('ledger_entries')
            .insert({
              user_id: pickup.user_id,
              transaction_type: 'badge_earned',
              points_change: badgeBonus,
              balance_after: badgeBalance,
              transaction_data: {
                badge_name: badgeName,
                earned_timestamp: new Date().toISOString()
              }
            });

          await supabaseClient
            .from('profiles')
            .update({ green_points: badgeBalance })
            .eq('id', pickup.user_id);

          console.log(`Awarded badge "${badgeName}" to user:`, pickup.user_id);
        }
      }
    }

    console.log(`Pickup ${pickup.id} completion processed. Weight bonus: ${weightBonus}, New streak: ${newStreak}`);

    return new Response(
      JSON.stringify({
        success: true,
        pickup_id: pickup.id,
        weight_bonus: weightBonus,
        new_balance: newBalance,
        new_streak: newStreak,
        badges_awarded: badgesToCheck.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing pickup completion:', error);
    
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