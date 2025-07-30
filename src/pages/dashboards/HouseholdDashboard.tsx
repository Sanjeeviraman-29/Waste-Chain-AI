import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Calendar,
  Camera,
  Clock,
  MapPin,
  Plus,
  Star,
  TrendingUp,
  Upload,
  CheckCircle,
  AlertCircle,
  Gift,
  Target,
  Zap,
  Recycle,
  Leaf,
  Trophy,
  Badge
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseClient, uploadImage, insertPickup, type Tables } from '../../lib/supabaseClient';

interface Pickup {
  id: string;
  waste_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
  estimated_weight: number | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
  pickup_address: string;
  image_url: string | null;
  scheduled_date: string | null;
  points_awarded: number;
  created_at: string;
}

interface UserStats {
  greenPoints: number;
  weeklyStreak: number;
  totalPickups: number;
  totalWeight: number;
  badges: Array<{ id: string; name: string; icon: string; earned_at: string }>;
}

const HouseholdDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    greenPoints: 2450,
    weeklyStreak: 7,
    totalPickups: 23,
    totalWeight: 156.5,
    badges: [
      { id: '1', name: 'First Pickup', icon: '🎯', earned_at: '2024-01-15' },
      { id: '2', name: 'Week Warrior', icon: '🔥', earned_at: '2024-01-20' },
      { id: '3', name: 'Eco Champion', icon: '🌱', earned_at: '2024-01-25' }
    ]
  });
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Schedule Pickup Form State
  const [scheduleForm, setScheduleForm] = useState({
    wasteType: '' as 'Plastic' | 'E-Waste' | 'Paper' | 'Organic' | '',
    image: null as File | null,
    estimatedWeight: '',
    specialInstructions: ''
  });
  const [uploadingPickup, setUploadingPickup] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // Fetch user pickups from live database
        const { data: pickupsData, error: pickupsError } = await supabaseClient
          .from('pickups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!pickupsError && pickupsData) {
          setPickups(pickupsData as Pickup[]);
        } else {
          console.error('Error fetching pickups:', pickupsError);
        }

        // Fetch user profile for stats
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setUserStats(prev => ({
            ...prev,
            greenPoints: profileData.green_points || prev.greenPoints,
            weeklyStreak: profileData.weekly_streak || prev.weeklyStreak,
            totalPickups: profileData.total_pickups || prev.totalPickups
          }));
        } else {
          console.error('Error fetching profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!user || !scheduleForm.wasteType || !scheduleForm.image) {
      alert('Please select waste type and upload an image');
      return;
    }

    try {
      setUploadingPickup(true);
      setPickupSuccess(null);

      // Step 1: Upload image to Supabase Storage
      const timestamp = Date.now();
      const imagePath = `public/${user.id}/${timestamp}.jpg`;

      const { url: imageUrl, error: uploadError } = await uploadImage(scheduleForm.image, imagePath);

      if (uploadError || !imageUrl) {
        throw new Error('Failed to upload image: ' + uploadError?.message);
      }

      // Step 2: Get user's address from profile or use fallback
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('address, city')
        .eq('id', user.id)
        .single();

      const userAddress = profileData?.address
        ? `${profileData.address}, ${profileData.city || ''}`.trim()
        : 'Address not provided';

      // Step 3: Insert pickup into database
      const pickupData = {
        user_id: user.id,
        waste_type: scheduleForm.wasteType,
        estimated_weight: scheduleForm.estimatedWeight ? parseFloat(scheduleForm.estimatedWeight) : null,
        pickup_address: userAddress,
        image_url: imageUrl,
        special_instructions: scheduleForm.specialInstructions || null,
        status: 'PENDING' as const,
        points_awarded: 0
      };

      const { data, error } = await insertPickup(pickupData);

      if (error) throw error;

      console.log('Pickup scheduled successfully:', data);

      // Step 4: Update user's pickup count
      await supabaseClient
        .from('profiles')
        .update({
          total_pickups: (userStats.totalPickups || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Success notification
      setPickupSuccess('Pickup Scheduled Successfully! Our team will contact you soon.');

      // Reset form and close modal
      setScheduleForm({
        wasteType: '',
        image: null,
        estimatedWeight: '',
        specialInstructions: ''
      });

      setTimeout(() => {
        setShowScheduleModal(false);
        setPickupSuccess(null);
      }, 2000);

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      alert('Error scheduling pickup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingPickup(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'collected': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Organic': return '🥬';
      case 'Plastic': return '♻️';
      case 'Paper': return '📄';
      case 'E-Waste': return '🔌';
      default: return '🗑️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Green Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Green Points</p>
                <p className="text-3xl font-bold">{userStats.greenPoints.toLocaleString()}</p>
              </div>
              <Award className="w-8 h-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm">+150 this week</span>
            </div>
          </motion.div>

          {/* Weekly Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Weekly Streak</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.weeklyStreak}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Target className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 text-sm">Keep it up!</span>
            </div>
          </motion.div>

          {/* Total Pickups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pickups</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalPickups}</p>
              </div>
              <Recycle className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 text-sm">All time</span>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Badges Earned</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.badges.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex space-x-1">
              {userStats.badges.slice(0, 3).map((badge) => (
                <span key={badge.id} className="text-lg">{badge.icon}</span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Schedule Pickup Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Schedule a Pickup</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Pickup</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { category: 'organic', label: 'Organic', color: 'green', icon: '🥬' },
                  { category: 'plastic', label: 'Plastic', color: 'blue', icon: '♻️' },
                  { category: 'paper', label: 'Paper', color: 'yellow', icon: '📄' },
                  { category: 'electronic', label: 'Electronic', color: 'purple', icon: '🔌' }
                ].map((type) => (
                  <motion.div
                    key={type.category}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border border-gray-200 rounded-lg text-center hover:border-green-300 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setScheduleForm(prev => ({ ...prev, wasteCategory: type.category }));
                      setShowScheduleModal(true);
                    }}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-600">Quick schedule</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Pickup History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Pickup History</h2>
                <p className="text-gray-600 text-sm mt-1">Track your recent waste collection requests</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waste Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pickups.map((pickup) => (
                      <tr key={pickup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">{getCategoryIcon(pickup.waste_category)}</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {pickup.waste_category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pickup.estimated_weight} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(pickup.status)}`}>
                            {pickup.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-green-500 mr-1" />
                            <span className="font-medium text-gray-900">{pickup.points_awarded}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(pickup.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Achievement Badges</h3>
              </div>
              
              <div className="space-y-3">
                {userStats.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-600">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>View Schedule</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span>Redeem Points</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>Leaderboard</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Pickup Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Pickup</h2>
                
                <div className="space-y-4">
                  {/* Waste Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Category
                    </label>
                    <select
                      value={scheduleForm.wasteCategory}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, wasteCategory: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="organic">🥬 Organic</option>
                      <option value="plastic">♻️ Plastic</option>
                      <option value="paper">📄 Paper</option>
                      <option value="electronic">🔌 Electronic</option>
                      <option value="hazardous">⚠️ Hazardous</option>
                    </select>
                  </div>

                  {/* Estimated Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={scheduleForm.estimatedWeight}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, estimatedWeight: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Address
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.address}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Photos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-300 transition-colors duration-200">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload photos</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setScheduleForm(prev => ({ ...prev, photos: files }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={scheduleForm.specialInstructions}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any special instructions for the collector..."
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSchedulePickup}
                    disabled={isLoading || !scheduleForm.wasteCategory || !scheduleForm.estimatedWeight}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? 'Scheduling...' : 'Schedule Pickup'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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

export default HouseholdDashboard;
