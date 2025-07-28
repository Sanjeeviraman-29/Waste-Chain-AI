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
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { mockDataService, shouldUseMockData } from '../../lib/mockDataService';
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

      // Try Supabase first, fallback to mock data if it fails
      try {
        if (supabase && isSupabaseAvailable()) {
          console.log('Fetching collectors from Supabase');
          const { data, error } = await supabase
            .from('collectors')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setCollectors(data || []);
          console.log('Successfully fetched collectors from Supabase:', data?.length || 0);
        } else {
          throw new Error('Supabase not available');
        }
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to mock data:', supabaseError);
        const { data, error } = await mockDataService.getCollectors();
        if (error) throw error;
        setCollectors(data || []);
        console.log('Using mock data, collectors:', data?.length || 0);
      }
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
      // Try Supabase first, fallback to mock data if it fails
      try {
        if (supabase && isSupabaseAvailable()) {
          const { error } = await supabase
            .from('collectors')
            .update({ is_active: !currentStatus })
            .eq('id', id);

          if (error) throw error;
        } else {
          throw new Error('Supabase not available');
        }
      } catch (supabaseError) {
        console.warn('Supabase failed, falling back to mock data:', supabaseError);
        const { error } = await mockDataService.updateCollectorStatus(id, !currentStatus);
        if (error) throw error;
      }

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

      {/* Collectors Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collector ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredCollectors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Truck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">No collectors found</p>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first collector.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCollectors.map((collector, index) => (
                  <motion.tr
                    key={collector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{collector.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {collector.collector_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{collector.collector_name}</div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(collector.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {collector.phone || 'Not provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Truck className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div>{collector.vehicle_type || 'Not specified'}</div>
                          {collector.license_plate && (
                            <div className="text-xs text-gray-500">{collector.license_plate}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {collector.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                        {collector.total_collections}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        collector.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {collector.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCollector(collector)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit collector"
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
                          title={collector.is_active ? 'Deactivate collector' : 'Activate collector'}
                        >
                          {collector.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
