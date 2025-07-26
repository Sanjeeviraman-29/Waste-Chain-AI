/*
  # WasteChain AI - EPR Dashboard Data Function
  # Session WCAI_0723
  
  Invokable function for complex data aggregation for corporate dashboard analytics.
  Returns comprehensive EPR compliance and analytics data.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DashboardRequest {
  date_range?: {
    start: string;
    end: string;
  };
  filters?: {
    waste_categories?: string[];
    locations?: string[];
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

    let requestData: DashboardRequest = {};
    
    if (req.method === 'POST') {
      requestData = await req.json();
    }

    // Default date range (last 30 days)
    const endDate = requestData.date_range?.end || new Date().toISOString();
    const startDate = requestData.date_range?.start || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    console.log('Generating EPR dashboard data for period:', startDate, 'to', endDate);

    // Build base query with filters
    let pickupsQuery = supabaseClient
      .from('pickups')
      .select(`
        *,
        profiles!inner(city, full_name),
        collectors(collector_name, vehicle_type)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (requestData.filters?.waste_categories?.length) {
      pickupsQuery = pickupsQuery.in('waste_category', requestData.filters.waste_categories);
    }

    const { data: pickups, error: pickupsError } = await pickupsQuery;

    if (pickupsError) {
      throw pickupsError;
    }

    // Aggregate data for dashboard
    const totalPickups = pickups?.length || 0;
    const completedPickups = pickups?.filter(p => p.status === 'completed') || [];
    const totalWeight = completedPickups.reduce((sum, p) => sum + (p.actual_weight || 0), 0);

    // Waste category breakdown
    const categoryBreakdown = pickups?.reduce((acc, pickup) => {
      const category = pickup.waste_category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          weight: 0,
          percentage: 0
        };
      }
      acc[category].count += 1;
      acc[category].weight += pickup.actual_weight || pickup.estimated_weight || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate percentages
    Object.keys(categoryBreakdown).forEach(category => {
      categoryBreakdown[category].percentage = 
        totalWeight > 0 ? (categoryBreakdown[category].weight / totalWeight) * 100 : 0;
    });

    // Geographic distribution
    const locationBreakdown = pickups?.reduce((acc, pickup) => {
      const city = pickup.profiles?.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = {
          count: 0,
          weight: 0
        };
      }
      acc[city].count += 1;
      acc[city].weight += pickup.actual_weight || pickup.estimated_weight || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    // Time series data (daily aggregation)
    const timeSeriesData = [];
    const dailyData = pickups?.reduce((acc, pickup) => {
      const date = pickup.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          pickups: 0,
          weight: 0,
          organic: 0,
          plastic: 0,
          paper: 0,
          electronic: 0,
          hazardous: 0,
          metal: 0,
          glass: 0,
          textile: 0
        };
      }
      acc[date].pickups += 1;
      acc[date].weight += pickup.actual_weight || pickup.estimated_weight || 0;
      acc[date][pickup.waste_category] += pickup.actual_weight || pickup.estimated_weight || 0;
      return acc;
    }, {} as Record<string, any>) || {};

    Object.values(dailyData).forEach((day: any) => {
      timeSeriesData.push(day);
    });

    // Sort time series by date
    timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Collector performance
    const { data: collectors, error: collectorsError } = await supabaseClient
      .from('collectors')
      .select(`
        *,
        pickups!inner(status, actual_weight, created_at)
      `)
      .gte('pickups.created_at', startDate)
      .lte('pickups.created_at', endDate);

    const collectorPerformance = collectors?.map(collector => ({
      id: collector.id,
      name: collector.collector_name,
      total_pickups: collector.pickups?.length || 0,
      completed_pickups: collector.pickups?.filter((p: any) => p.status === 'completed').length || 0,
      total_weight: collector.pickups?.reduce((sum: number, p: any) => sum + (p.actual_weight || 0), 0) || 0,
      efficiency: collector.pickups?.length > 0 ? 
        (collector.pickups.filter((p: any) => p.status === 'completed').length / collector.pickups.length) * 100 : 0
    })) || [];

    // EPR Compliance metrics
    const recyclingRate = totalWeight > 0 ? 
      (completedPickups.reduce((sum, p) => sum + (p.actual_weight || 0), 0) / totalWeight) * 100 : 0;

    const complianceScore = Math.min(100, 
      (completedPickups.length / Math.max(totalPickups, 1)) * 100 * 0.6 + 
      recyclingRate * 0.4
    );

    // Environmental impact calculations
    const carbonSaved = totalWeight * 2.3; // kg CO2 per kg waste
    const energySaved = totalWeight * 15; // kWh per kg waste
    const wasteRedirection = totalPickups > 0 ? (completedPickups.length / totalPickups) * 100 : 0;

    // User engagement metrics
    const { data: activeUsers } = await supabaseClient
      .from('profiles')
      .select('id, green_points, weekly_streak, total_pickups')
      .gte('last_pickup_date', startDate);

    const userEngagement = {
      total_active_users: activeUsers?.length || 0,
      average_green_points: activeUsers?.reduce((sum, u) => sum + (u.green_points || 0), 0) / Math.max(activeUsers?.length || 1, 1),
      users_with_streak: activeUsers?.filter(u => (u.weekly_streak || 0) > 0).length || 0,
      top_performers: activeUsers?.sort((a, b) => (b.green_points || 0) - (a.green_points || 0)).slice(0, 10) || []
    };

    // Construct comprehensive response
    const dashboardData = {
      summary: {
        total_pickups: totalPickups,
        completed_pickups: completedPickups.length,
        total_weight_kg: Math.round(totalWeight * 10) / 10,
        completion_rate: totalPickups > 0 ? (completedPickups.length / totalPickups) * 100 : 0,
        average_weight_per_pickup: totalPickups > 0 ? totalWeight / totalPickups : 0
      },
      epr_compliance: {
        recycling_rate: Math.round(recyclingRate * 10) / 10,
        compliance_score: Math.round(complianceScore * 10) / 10,
        waste_redirection_rate: Math.round(wasteRedirection * 10) / 10,
        regulatory_adherence: Math.min(100, complianceScore + 5) // Simulated
      },
      environmental_impact: {
        carbon_saved_kg: Math.round(carbonSaved * 10) / 10,
        energy_saved_kwh: Math.round(energySaved * 10) / 10,
        landfill_diversion_kg: Math.round(totalWeight * 0.85 * 10) / 10
      },
      waste_categories: categoryBreakdown,
      geographic_distribution: locationBreakdown,
      time_series: timeSeriesData,
      collector_performance: collectorPerformance,
      user_engagement: userEngagement,
      generated_at: new Date().toISOString(),
      period: {
        start: startDate,
        end: endDate
      }
    };

    console.log('EPR dashboard data generated successfully');

    return new Response(
      JSON.stringify(dashboardData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating EPR dashboard data:', error);
    
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