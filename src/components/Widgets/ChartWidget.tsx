import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

const ChartWidget: React.FC = () => {
  const { t } = useTranslation();

  const data = [
    { date: '2024-01-01', organic: 120, plastic: 80, paper: 60, electronic: 20 },
    { date: '2024-01-02', organic: 140, plastic: 90, paper: 70, electronic: 25 },
    { date: '2024-01-03', organic: 100, plastic: 75, paper: 55, electronic: 18 },
    { date: '2024-01-04', organic: 160, plastic: 110, paper: 80, electronic: 30 },
    { date: '2024-01-05', organic: 180, plastic: 95, paper: 75, electronic: 28 },
    { date: '2024-01-06', organic: 145, plastic: 85, paper: 65, electronic: 22 },
    { date: '2024-01-07', organic: 165, plastic: 100, paper: 78, electronic: 32 }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Main Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('widgets.wasteTrends')}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('wasteTypes.organic')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('wasteTypes.plastic')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('wasteTypes.paper')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('wasteTypes.electronic')}</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              labelFormatter={(label) => formatDate(label)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="organic"
              stackId="1"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="plastic"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="paper"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="electronic"
              stackId="1"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Collection Efficiency Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Collection Efficiency
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.slice(-4)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="organic" fill="#228B22" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Processing Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.slice(-4)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="plastic" 
                stroke="#228B22" 
                strokeWidth={3}
                dot={{ fill: '#228B22', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#228B22', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default ChartWidget;