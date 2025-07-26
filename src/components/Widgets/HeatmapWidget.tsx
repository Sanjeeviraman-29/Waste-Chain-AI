import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Filter, Download } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';

const HeatmapWidget: React.FC = () => {
  const { t } = useTranslation();
  const { wasteData } = useDashboardStore();

  // Simulate heatmap data
  const heatmapData = [
    { lat: 13.0827, lng: 80.2707, intensity: 0.8, area: 'Chennai Central', count: 45 },
    { lat: 13.0435, lng: 80.2341, intensity: 0.6, area: 'T. Nagar', count: 32 },
    { lat: 13.0067, lng: 80.2206, intensity: 0.9, area: 'Adyar', count: 58 },
    { lat: 13.0878, lng: 80.2785, intensity: 0.4, area: 'Egmore', count: 23 },
    { lat: 13.0524, lng: 80.2620, intensity: 0.7, area: 'Mylapore', count: 41 }
  ];

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500';
    if (intensity >= 0.6) return 'bg-orange-500';
    if (intensity >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 0.8) return 'High';
    if (intensity >= 0.6) return 'Medium-High';
    if (intensity >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('widgets.heatmap')}
          </h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="p-6">
        <div className="relative bg-gray-50 rounded-lg h-80 overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 400 320">
                {/* Chennai outline simulation */}
                <path
                  d="M50 50 L350 50 L350 270 L50 270 Z"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <path
                  d="M100 100 L300 100 L300 220 L100 220 Z"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          {/* Heatmap Points */}
          {heatmapData.map((point, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute"
              style={{
                left: `${20 + (point.lng - 80.1) * 800}%`,
                top: `${20 + (13.1 - point.lat) * 800}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                {/* Heatmap circle */}
                <div
                  className={`w-8 h-8 ${getIntensityColor(point.intensity)} rounded-full opacity-70 animate-pulse`}
                  style={{
                    boxShadow: `0 0 ${point.intensity * 30}px ${
                      point.intensity >= 0.8 ? 'rgba(239, 68, 68, 0.4)' :
                      point.intensity >= 0.6 ? 'rgba(249, 115, 22, 0.4)' :
                      point.intensity >= 0.4 ? 'rgba(234, 179, 8, 0.4)' :
                      'rgba(34, 197, 94, 0.4)'
                    }`
                  }}
                />
                
                {/* Location pin */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <MapPin className="w-4 h-4 text-white" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-medium">{point.area}</div>
                    <div>Collections: {point.count}</div>
                    <div>Intensity: {getIntensityLabel(point.intensity)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Intensity:</span>
            {[
              { color: 'bg-green-500', label: 'Low' },
              { color: 'bg-yellow-500', label: 'Medium' },
              { color: 'bg-orange-500', label: 'High' },
              { color: 'bg-red-500', label: 'Critical' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Area Statistics */}
      <div className="border-t border-gray-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {heatmapData.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-lg font-bold text-gray-900">{area.count}</div>
              <div className="text-xs text-gray-600">{area.area}</div>
              <div className={`w-2 h-1 ${getIntensityColor(area.intensity)} rounded-full mx-auto mt-1`}></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HeatmapWidget;