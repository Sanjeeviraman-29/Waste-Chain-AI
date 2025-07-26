import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Truck,
  Phone,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddCollectorModal from '../collectors/AddCollectorModal';

interface Collector {
  id: string;
  collector_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  service_areas: string[];
  is_active: boolean;
  rating: number;
  total_collections: number;
  created_at: string;
}

const CollectorManagement: React.FC = () => {
  const { t } = useTranslation();
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('collectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollectors(data || []);
    } catch (error) {
      console.error('Error fetching collectors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchCollectors(); // Refresh the collectors list
  };

  const toggleCollectorStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('collectors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCollectors();
    } catch (error) {
      console.error('Error updating collector status:', error);
    }
  };

  const filteredCollectors = collectors.filter(collector =>
    collector.collector_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.phone.includes(searchTerm)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collector Management</h2>
          <p className="text-gray-600 mt-1">
            Onboard, verify, and manage waste collectors
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Collector</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Collectors',
            value: collectors.length.toString(),
            icon: Truck,
            color: 'blue'
          },
          {
            title: 'Active Collectors',
            value: collectors.filter(c => c.is_active).length.toString(),
            icon: CheckCircle,
            color: 'green'
          },
          {
            title: 'Average Rating',
            value: (collectors.reduce((sum, c) => sum + c.rating, 0) / collectors.length || 0).toFixed(1),
            icon: Star,
            color: 'yellow'
          },
          {
            title: 'Total Collections',
            value: collectors.reduce((sum, c) => sum + c.total_collections, 0).toString(),
            icon: TrendingUp,
            color: 'purple'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collectors by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>
        </div>
      </div>

      {/* Collectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          filteredCollectors.map((collector) => (
            <motion.div
              key={collector.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{collector.collector_name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{collector.phone}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">{collector.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{collector.vehicle_type}</span>
                  <span className="text-xs text-gray-500">({collector.license_plate})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {collector.service_areas.length} service areas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {collector.total_collections} collections
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  collector.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {collector.is_active ? 'Active' : 'Inactive'}
                </span>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCollector(collector)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCollectorStatus(collector.id, collector.is_active)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      collector.is_active
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {collector.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Collector Modal */}
      <AddCollectorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </motion.div>
  );
};

export default CollectorManagement;