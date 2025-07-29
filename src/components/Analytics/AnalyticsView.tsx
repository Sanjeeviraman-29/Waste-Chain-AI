import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, Users, Recycle } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

interface AnalyticsData {
  wasteByType: Array<{ name: string; value: number; color: string }>;
  collectionTrends: Array<{ date: string; organic: number; plastic: number; paper: number; electronic: number }>;
  topCollectors: Array<{ name: string; collections: number; weight: number; efficiency: number }>;
}

const AnalyticsView: React.FC = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    wasteByType: [],
    collectionTrends: [],
    topCollectors: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      let eprData: any;

      // Try Supabase first, fallback to mock data if it fails
      try {
        if (supabase && isSupabaseAvailable()) {
          console.log('Fetching analytics data from Supabase');
          const { data, error } = await supabase.functions.invoke('get-epr-dashboard-data', {
            body: {
              date_range: {
                start: dateRange.start,
                end: dateRange.end
              }
            }
          });

          if (error) throw error;
          eprData = data;
          console.log('Successfully fetched analytics data from Supabase');
        } else {
          throw new Error('Supabase not available');
        }
      } catch (supabaseError) {
        console.warn('Supabase failed, using mock analytics data:', supabaseError);

        // Generate mock analytics data
        eprData = {
          waste_categories: {
            organic: { weight: 450.5, count: 23 },
            plastic: { weight: 320.2, count: 18 },
            paper: { weight: 280.7, count: 15 },
            electronic: { weight: 150.3, count: 8 },
            hazardous: { weight: 75.1, count: 4 }
          },
          time_series: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), organic: 65, plastic: 45, paper: 40, electronic: 20 },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), organic: 70, plastic: 50, paper: 35, electronic: 25 },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), organic: 75, plastic: 55, paper: 45, electronic: 30 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), organic: 68, plastic: 48, paper: 38, electronic: 22 },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), organic: 80, plastic: 60, paper: 50, electronic: 35 },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), organic: 85, plastic: 65, paper: 55, electronic: 40 },
            { date: new Date().toISOString(), organic: 90, plastic: 70, paper: 60, electronic: 45 }
          ],
          collector_performance: [
            { name: 'Rajesh Kumar', total_pickups: 156, total_weight: 850.5, efficiency: 94.5 },
            { name: 'Priya Sharma', total_pickups: 203, total_weight: 1120.2, efficiency: 92.8 },
            { name: 'Mohammed Ali', total_pickups: 98, total_weight: 520.7, efficiency: 89.3 },
            { name: 'Deepika Singh', total_pickups: 145, total_weight: 780.1, efficiency: 87.6 },
            { name: 'Arjun Patel', total_pickups: 167, total_weight: 920.4, efficiency: 85.2 }
          ]
        };
      }

      // Transform waste category data
      const wasteColors = {
        organic: '#22c55e',
        plastic: '#3b82f6',
        paper: '#8b5cf6',
        electronic: '#f97316',
        hazardous: '#ef4444',
        metal: '#6b7280',
        glass: '#06b6d4',
        textile: '#ec4899'
      };

      const wasteByType = Object.entries(eprData.waste_categories || {}).map(([category, data]: [string, any]) => ({
        name: t(`wasteTypes.${category}`),
        value: data.weight || 0,
        color: wasteColors[category as keyof typeof wasteColors] || '#6b7280'
      }));

      // Use time series data for trends
      const collectionTrends = (eprData.time_series || []).slice(-7).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        organic: item.organic || 0,
        plastic: item.plastic || 0,
        paper: item.paper || 0,
        electronic: item.electronic || 0
      }));

      // Transform collector performance data
      const topCollectors = (eprData.collector_performance || [])
        .sort((a: any, b: any) => b.efficiency - a.efficiency)
        .slice(0, 5)
        .map((collector: any) => ({
          name: collector.name,
          collections: collector.total_pickups,
          weight: collector.total_weight,
          efficiency: collector.efficiency
        }));

      setAnalyticsData({
        wasteByType,
        collectionTrends,
        topCollectors
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(1)} kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('dashboard.analytics')}
          </h2>
          <p className="text-gray-600 mt-1">
            Advanced analytics and trends for waste collection data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste by Type Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Recycle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Waste Collected by Type</h3>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.wasteByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.wasteByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Weight']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Collection Trends Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Collection Trends Over Time</h3>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.collectionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="organic" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="plastic" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="paper" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="electronic" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Top Collector Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Top Collector Performance</h3>
        </div>
        
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topCollectors} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'efficiency' ? `${value.toFixed(1)}%` : value.toFixed(1),
                  name === 'collections' ? 'Collections' : name === 'weight' ? 'Weight (kg)' : 'Efficiency'
                ]}
              />
              <Legend />
              <Bar dataKey="collections" fill="#22c55e" name="Collections" />
              <Bar dataKey="weight" fill="#3b82f6" name="Weight (kg)" />
              <Bar dataKey="efficiency" fill="#8b5cf6" name="Efficiency (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsView;
