import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Truck, Award, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';

const StatsWidget: React.FC = () => {
  const { t } = useTranslation();
  const { realTimeStats, isLoading, fetchRealTimeStats } = useDashboardStore();

  useEffect(() => {
    fetchRealTimeStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, [fetchRealTimeStats]);

  const stats = [
    {
      title: t('stats.totalWaste'),
      value: realTimeStats.totalWaste.toLocaleString(),
      unit: 'kg',
      change: '+12.5%',
      trend: 'up',
      icon: Trash2,
      color: 'green'
    },
    {
      title: t('stats.activeCollectors'),
      value: realTimeStats.activeCollectors.toString(),
      unit: 'active',
      change: '+3',
      trend: 'up',
      icon: Truck,
      color: 'blue'
    },
    {
      title: t('stats.completedRoutes'),
      value: realTimeStats.completedRoutes.toString(),
      unit: 'routes',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: t('stats.greenPoints'),
      value: realTimeStats.greenPoints.toLocaleString(),
      unit: 'points',
      change: '+15.3%',
      trend: 'up',
      icon: Award,
      color: 'orange'
    }
  ];

  const colorVariants = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg border ${colorVariants[stat.color as keyof typeof colorVariants]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <TrendIcon className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {stat.unit}
                </span>
              </p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsWidget;