import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Clock,
  Package,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Star,
  Navigation,
  QrCode,
  Camera,
  AlertCircle,
  Trophy,
  Calendar,
  Truck,
  Weight,
  Route,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

interface AvailablePickup {
  id: string;
  user_id: string;
  waste_category: string;
  estimated_weight: number;
  pickup_address: string;
  scheduled_date: string;
  special_instructions?: string;
  distance?: number;
  estimated_earnings: number;
  profiles?: {
    full_name: string;
    phone: string;
  };
}

interface CollectorStats {
  todayEarnings: number;
  weeklyEarnings: number;
  totalCollections: number;
  rating: number;
  completionRate: number;
}

interface SelectedPickup extends AvailablePickup {
  qrCode?: string;
}

const CollectorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [availablePickups, setAvailablePickups] = useState<AvailablePickup[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<SelectedPickup | null>(null);
  const [collectorStats, setCollectorStats] = useState<CollectorStats>({
    todayEarnings: 450.75,
    weeklyEarnings: 2840.50,
    totalCollections: 156,
    rating: 4.8,
    completionRate: 94.5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailablePickups();
  }, []);

  const fetchAvailablePickups = async () => {
    try {
      setIsLoading(true);
      
      if (supabase && isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('pickups')
          .select(`
            *,
            profiles!inner(full_name, phone)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const pickupsWithEarnings = data.map(pickup => ({
            ...pickup,
            estimated_earnings: calculateEarnings(pickup.waste_category, pickup.estimated_weight),
            distance: Math.random() * 10 + 1 // Mock distance
          }));
          setAvailablePickups(pickupsWithEarnings);
        }
      } else {
        // Mock data for demo mode
        const mockPickups: AvailablePickup[] = [
          {
            id: '1',
            user_id: 'user_1',
            waste_category: 'plastic',
            estimated_weight: 5.2,
            pickup_address: '123 Green Street, T. Nagar, Chennai',
            scheduled_date: '2024-01-18T10:00:00Z',
            special_instructions: 'Please ring the doorbell twice',
            distance: 2.3,
            estimated_earnings: 52,
            profiles: {
              full_name: 'Rajesh Kumar',
              phone: '+91 98765 43210'
            }
          },
          {
            id: '2',
            user_id: 'user_2',
            waste_category: 'organic',
            estimated_weight: 8.5,
            pickup_address: '456 Eco Lane, Adyar, Chennai',
            scheduled_date: '2024-01-18T14:00:00Z',
            distance: 4.7,
            estimated_earnings: 85,
            profiles: {
              full_name: 'Priya Sharma',
              phone: '+91 87654 32109'
            }
          },
          {
            id: '3',
            user_id: 'user_3',
            waste_category: 'paper',
            estimated_weight: 3.2,
            pickup_address: '789 Recycle Road, Anna Nagar, Chennai',
            scheduled_date: '2024-01-18T16:30:00Z',
            distance: 6.1,
            estimated_earnings: 32,
            profiles: {
              full_name: 'Mohammed Ali',
              phone: '+91 76543 21098'
            }
          },
          {
            id: '4',
            user_id: 'user_4',
            waste_category: 'electronic',
            estimated_weight: 12.0,
            pickup_address: '321 Tech Street, Velachery, Chennai',
            scheduled_date: '2024-01-18T11:30:00Z',
            distance: 8.9,
            estimated_earnings: 180,
            profiles: {
              full_name: 'Sarah Johnson',
              phone: '+91 65432 10987'
            }
          }
        ];
        setAvailablePickups(mockPickups);
      }
    } catch (error) {
      console.error('Error fetching available pickups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEarnings = (category: string, weight: number): number => {
    const rates = {
      organic: 10,
      plastic: 15,
      paper: 12,
      electronic: 25,
      hazardous: 30
    };
    return (rates[category as keyof typeof rates] || 10) * weight;
  };

  const acceptPickup = (pickup: AvailablePickup) => {
    const qrCode = `QR${pickup.id.toUpperCase()}${Date.now().toString().slice(-4)}`;
    setSelectedPickup({ ...pickup, qrCode });
    setShowQrModal(true);
  };

  const confirmPickup = async () => {
    if (!selectedPickup || !qrInput) return;

    try {
      setIsLoading(true);

      // Validate QR code
      if (qrInput !== selectedPickup.qrCode) {
        alert('Invalid QR code. Please scan the correct pickup QR code.');
        return;
      }

      if (supabase && isSupabaseAvailable()) {
        const { error } = await supabase
          .from('pickups')
          .update({ 
            status: 'completed',
            collector_id: user?.id,
            collected_date: new Date().toISOString(),
            actual_weight: selectedPickup.estimated_weight,
            points_awarded: selectedPickup.estimated_earnings
          })
          .eq('id', selectedPickup.id);

        if (error) throw error;
      } else {
        // Mock completion
        console.log('Pickup completed (demo mode):', selectedPickup.id);
      }

      // Update local state
      setAvailablePickups(prev => prev.filter(p => p.id !== selectedPickup.id));
      setCollectorStats(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + selectedPickup.estimated_earnings,
        weeklyEarnings: prev.weeklyEarnings + selectedPickup.estimated_earnings,
        totalCollections: prev.totalCollections + 1
      }));

      setConfirmationMessage(`Pickup completed! You earned ₹${selectedPickup.estimated_earnings}`);
      setShowQrModal(false);
      setSelectedPickup(null);
      setQrInput('');

      // Clear confirmation message after 3 seconds
      setTimeout(() => setConfirmationMessage(null), 3000);
    } catch (error) {
      console.error('Error confirming pickup:', error);
      alert('Error confirming pickup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organic': return '🥬';
      case 'plastic': return '♻️';
      case 'paper': return '📄';
      case 'electronic': return '🔌';
      case 'hazardous': return '⚠️';
      default: return '🗑️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'organic': return 'bg-green-100 text-green-800';
      case 'plastic': return 'bg-blue-100 text-blue-800';
      case 'paper': return 'bg-yellow-100 text-yellow-800';
      case 'electronic': return 'bg-purple-100 text-purple-800';
      case 'hazardous': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Collector Dashboard</h1>
                <p className="text-gray-600">{user?.user_metadata?.full_name || user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Confirmation Message */}
        <AnimatePresence>
          {confirmationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">{confirmationMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Today's Earnings</p>
                <p className="text-2xl font-bold">₹{collectorStats.todayEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Weekly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{collectorStats.weeklyEarnings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Collections</p>
                <p className="text-2xl font-bold text-gray-900">{collectorStats.totalCollections}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{collectorStats.rating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{collectorStats.completionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Available Pickups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Available Pickups</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {availablePickups.length} pickup{availablePickups.length !== 1 ? 's' : ''} available in your area
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                <span>Real-time updates</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available pickups...</p>
            </div>
          ) : availablePickups.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pickups available</h3>
              <p className="text-gray-600">Check back later for new pickup opportunities</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {availablePickups.map((pickup, index) => (
                <motion.div
                  key={pickup.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                    {/* Pickup Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{getCategoryIcon(pickup.waste_category)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(pickup.waste_category)}`}>
                              {pickup.waste_category}
                            </span>
                            <span className="text-sm text-gray-600">
                              {pickup.estimated_weight} kg
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{pickup.pickup_address}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(pickup.scheduled_date).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Navigation className="w-4 h-4" />
                              <span>{pickup.distance?.toFixed(1)} km away</span>
                            </div>
                          </div>
                          {pickup.special_instructions && (
                            <div className="mt-2 text-sm text-blue-600">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              {pickup.special_instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {pickup.profiles?.full_name || 'Customer'}
                        </p>
                        <p className="text-gray-600">{pickup.profiles?.phone}</p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="text-lg font-bold text-green-600">
                          ₹{pickup.estimated_earnings}
                        </span>
                        <p className="text-xs text-gray-600">Estimated earnings</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => acceptPickup(pickup)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Accept Job
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && selectedPickup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Pickup Confirmation</h2>
                  <p className="text-gray-600 text-sm">
                    Scan the customer's QR code to confirm pickup completion
                  </p>
                </div>

                {/* Pickup Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(selectedPickup.waste_category)}</span>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {selectedPickup.waste_category} Waste
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedPickup.estimated_weight} kg • ₹{selectedPickup.estimated_earnings}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedPickup.pickup_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(selectedPickup.scheduled_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Demo QR Code Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-800 mb-2">Demo QR Code:</p>
                    <p className="text-lg font-mono text-blue-900 bg-white px-3 py-2 rounded border">
                      {selectedPickup.qrCode}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Copy this code to the input below (demo mode)
                    </p>
                  </div>
                </div>

                {/* QR Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Pickup QR Code ID
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                      placeholder="Scan or enter QR code"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmPickup}
                    disabled={isLoading || !qrInput}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Pickup</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowQrModal(false);
                      setSelectedPickup(null);
                      setQrInput('');
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectorDashboard;
