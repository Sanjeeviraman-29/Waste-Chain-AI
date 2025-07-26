import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { MapPin, Filter, Download } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveHeatmap: React.FC = () => {
  const { t } = useTranslation();
  const { heatmapData, fetchHeatmapData } = useDashboardStore();

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return '#ef4444'; // red-500
    if (intensity >= 0.6) return '#f97316'; // orange-500
    if (intensity >= 0.4) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
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

      {/* Interactive Map */}
      <div className="h-80">
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {heatmapData.map((point, index) => (
            <CircleMarker
              key={index}
              center={[point.lat, point.lng]}
              radius={Math.max(8, point.intensity * 20)}
              fillColor={getIntensityColor(point.intensity)}
              color={getIntensityColor(point.intensity)}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{point.area}</div>
                  <div className="text-gray-600">Collections: {point.count}</div>
                  <div className="text-gray-600">Intensity: {getIntensityLabel(point.intensity)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Intensity:</span>
            {[
              { color: '#22c55e', label: 'Low' },
              { color: '#eab308', label: 'Medium' },
              { color: '#f97316', label: 'High' },
              { color: '#ef4444', label: 'Critical' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {heatmapData.slice(0, 4).map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-lg font-bold text-gray-900">{area.count}</div>
              <div className="text-xs text-gray-600">{area.area}</div>
              <div 
                className="w-2 h-1 rounded-full mx-auto mt-1"
                style={{ backgroundColor: getIntensityColor(area.intensity) }}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveHeatmap;