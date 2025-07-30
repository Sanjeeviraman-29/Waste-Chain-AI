import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Award,
  TrendingUp,
  ShoppingCart,
  Download,
  FileText,
  CreditCard,
  Leaf,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Recycle,
  Globe,
  Users,
  Package,
  Shield,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  supabaseClient,
  getAvailableEPRCredits,
  getCompanyCredits,
  getCreditDigitalTrail,
  purchaseEPRCredit,
  type Tables
} from '../../lib/supabaseClient';
// Import jsPDF for report generation
import jsPDF from 'jspdf';

interface CompanyStats {
  totalWasteRecycled: number;
  totalEPRCredits: number;
  complianceScore: number;
  carbonFootprintReduced: number;
  activePartners: number;
  monthlySpend: number;
}

interface EPRCredit {
  id: string;
  credit_type: string;
  description: string;
  weight_kg: number;
  type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
  price: number;
  status: 'AVAILABLE' | 'SOLD' | 'RETIRED';
  company_id: string | null;
  pickup_id: string | null;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CreditDigitalTrail {
  id: string;
  credit_type: string;
  description: string;
  weight_kg: number;
  material_type: string;
  pickup_id: string | null;
  pickups?: {
    id: string;
    user_id: string;
    waste_type: string;
    pickup_address: string;
    image_url: string | null;
    status: string;
    created_at: string;
  } | null;
  ledger_entries?: Array<{
    id: string;
    transaction_type: string;
    amount: number | null;
    created_at: string;
    transaction_data: any;
  }>;
}

const CompanyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalWasteRecycled: 15750.5,
    totalEPRCredits: 2840,
    complianceScore: 94.5,
    carbonFootprintReduced: 47.2,
    activePartners: 156,
    monthlySpend: 85400
  });
  const [availableCredits, setAvailableCredits] = useState<EPRCredit[]>([]);
  const [myCredits, setMyCredits] = useState<EPRCredit[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-credits'>('marketplace');
  const [isLoading, setIsLoading] = useState(false);
  const [showDigitalTrail, setShowDigitalTrail] = useState(false);
  const [selectedCreditTrail, setSelectedCreditTrail] = useState<CreditDigitalTrail | null>(null);
  const [purchasingCreditId, setPurchasingCreditId] = useState<string | null>(null);
  const [reportDateRange, setReportDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });



  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);

      if (user) {
        // Fetch available EPR credits
        const { data: availableData, error: availableError } = await getAvailableEPRCredits();
        if (!availableError && availableData) {
          setAvailableCredits(availableData as EPRCredit[]);
        }

        // Fetch company's purchased credits
        const { data: myCreditsData, error: myCreditsError } = await getCompanyCredits(user.id);
        if (!myCreditsError && myCreditsData) {
          setMyCredits(myCreditsData as EPRCredit[]);

          // Update company stats based on owned credits
          const totalWeight = myCreditsData.reduce((sum, credit) => sum + credit.weight_kg, 0);
          const totalAmount = myCreditsData.reduce((sum, credit) => sum + credit.price, 0);

          setCompanyStats(prev => ({
            ...prev,
            totalWasteRecycled: totalWeight,
            totalEPRCredits: myCreditsData.length,
            monthlySpend: totalAmount
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredit = async (creditId: string) => {
    if (!user) return;

    try {
      setPurchasingCreditId(creditId);

      // Purchase the credit using Supabase RPC function or direct update
      const { error } = await supabaseClient
        .from('epr_credits')
        .update({
          status: 'SOLD',
          company_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditId)
        .eq('status', 'AVAILABLE'); // Ensure it's still available

      if (error) throw error;

      // Create ledger entry
      await supabaseClient
        .from('ledger_entries')
        .insert([{
          user_id: user.id,
          epr_credit_id: creditId,
          transaction_type: 'credit_purchased',
          amount: availableCredits.find(c => c.id === creditId)?.price || 0,
          transaction_data: {
            action: 'EPR Credit Purchase',
            credit_id: creditId
          }
        }]);

      alert('EPR Credit purchased successfully!');
      fetchCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error purchasing credit:', error);
      alert('Error purchasing credit. Please try again.');
    } finally {
      setPurchasingCreditId(null);
    }
  };

  const viewDigitalTrail = async (creditId: string) => {
    try {
      setIsLoading(true);
      const trailData = await getCreditDigitalTrail(creditId);
      setSelectedCreditTrail(trailData as CreditDigitalTrail);
      setShowDigitalTrail(true);
    } catch (error) {
      console.error('Error fetching digital trail:', error);
      alert('Error loading digital trail.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateComplianceReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('EPR Compliance Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Company: ${user?.user_metadata?.company_name || user?.user_metadata?.full_name || 'Company'}`, 20, 35);
    doc.text(`Report Period: ${reportDateRange.start} to ${reportDateRange.end}`, 20, 45);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);

    // Stats
    doc.setFontSize(16);
    doc.text('Compliance Summary', 20, 75);

    doc.setFontSize(12);
    doc.text(`Total Waste Recycled via EPR Credits: ${companyStats.totalWasteRecycled.toFixed(1)} kg`, 20, 90);
    doc.text(`Total EPR Credits Purchased: ${companyStats.totalEPRCredits}`, 20, 100);
    doc.text(`Compliance Score: ${companyStats.complianceScore}%`, 20, 110);
    doc.text(`Total Investment: ₹${companyStats.monthlySpend.toLocaleString()}`, 20, 120);

    // Credit breakdown by material type
    doc.setFontSize(16);
    doc.text('Credit Breakdown by Material Type', 20, 140);

    const materialBreakdown = myCredits.reduce((acc, credit) => {
      acc[credit.material_type] = (acc[credit.material_type] || 0) + credit.weight_kg;
      return acc;
    }, {} as Record<string, number>);

    let yPos = 155;
    Object.entries(materialBreakdown).forEach(([material, weight], index) => {
      doc.setFontSize(10);
      doc.text(`${material}: ${weight.toFixed(1)} kg`, 20, yPos + (index * 10));
    });

    // Recent credits
    doc.setFontSize(16);
    doc.text('Recent Credit Purchases', 20, 200);

    yPos = 215;
    myCredits.slice(0, 5).forEach((credit, index) => {
      doc.setFontSize(10);
      doc.text(
        `${new Date(credit.updated_at).toLocaleDateString()} - ${credit.description} - ${credit.weight_kg}kg - ₹${credit.price.toLocaleString()}`,
        20,
        yPos + (index * 10)
      );
    });

    // Footer
    doc.setFontSize(8);
    doc.text('This report is generated by WasteChain AI EPR Management System', 20, 280);
    doc.text('For questions, contact: compliance@wastechain.ai', 20, 290);

    // Save the PDF
    doc.save(`EPR_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="text-gray-600">
                  {user?.user_metadata?.company_name || user?.user_metadata?.full_name || user?.email}
                </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Waste Recycled</p>
                <p className="text-3xl font-bold">{companyStats.totalWasteRecycled.toLocaleString()} kg</p>
              </div>
              <Recycle className="w-8 h-8 text-green-200" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-200" />
              <span className="text-green-100 text-sm">+12% this month</span>
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
                <p className="text-gray-600 text-sm">EPR Credits Purchased</p>
                <p className="text-3xl font-bold text-gray-900">{companyStats.totalEPRCredits.toLocaleString()}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 text-sm">Compliance active</span>
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
                <p className="text-gray-600 text-sm">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-900">{companyStats.complianceScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${companyStats.complianceScore}%` }}
                ></div>
              </div>
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
                <p className="text-gray-600 text-sm">Carbon Footprint Reduced</p>
                <p className="text-3xl font-bold text-gray-900">{companyStats.carbonFootprintReduced} t CO₂</p>
              </div>
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 text-sm">Environmental impact</span>
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
                <p className="text-gray-600 text-sm">Active Partners</p>
                <p className="text-3xl font-bold text-gray-900">{companyStats.activePartners}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Package className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600 text-sm">Waste collectors</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Spend</p>
                <p className="text-3xl font-bold text-gray-900">₹{companyStats.monthlySpend.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 text-sm">EPR investments</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* EPR Credit Marketplace */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6 py-4">
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'marketplace'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    EPR Credit Marketplace
                  </button>
                  <button
                    onClick={() => setActiveTab('my-credits')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'my-credits'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Credits ({myCredits.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'marketplace' ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Available EPR Credits</h3>
                      <p className="text-gray-600 text-sm">
                        Purchase verified EPR credits from our certified waste collection network
                      </p>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading available credits...</p>
                      </div>
                    ) : availableCredits.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Credits Available</h3>
                        <p className="text-gray-600">Check back later for new EPR credits</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableCredits.map((credit) => (
                          <motion.div
                            key={credit.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg">{credit.material_type === 'Plastic' ? '♻️' : credit.material_type === 'E-Waste' ? '🔌' : credit.material_type === 'Paper' ? '📄' : '🥬'}</span>
                              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                {credit.material_type}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{credit.description}</h4>
                            <p className="text-sm text-gray-600 mb-3">{credit.weight_kg}kg verified waste</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-purple-600">₹{credit.price.toLocaleString()}</span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePurchaseCredit(credit.id)}
                                disabled={purchasingCreditId === credit.id}
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
                              >
                                {purchasingCreditId === credit.id ? 'Purchasing...' : 'Purchase'}
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">My EPR Credits</h3>
                      <p className="text-gray-600 text-sm">
                        Track and manage your purchased EPR credits with full digital trail
                      </p>
                    </div>

                    {myCredits.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Credits Purchased</h3>
                        <p className="text-gray-600">Purchase credits from the marketplace to see them here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Material
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Weight
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {myCredits.map((credit) => (
                              <tr key={credit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-lg mr-3">{credit.material_type === 'Plastic' ? '♻️' : credit.material_type === 'E-Waste' ? '🔌' : credit.material_type === 'Paper' ? '📄' : '🥬'}</span>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{credit.description}</div>
                                      <div className="text-sm text-gray-500">#{credit.id.slice(-8).toUpperCase()}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                    {credit.material_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {credit.weight_kg} kg
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{credit.price.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => viewDigitalTrail(credit.id)}
                                    className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                                  >
                                    View Digital Trail
                                  </motion.button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Digital Trail Modal */}
            <AnimatePresence>
              {showDigitalTrail && selectedCreditTrail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Digital Trail</h2>
                        <button
                          onClick={() => setShowDigitalTrail(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">Complete journey of EPR Credit #{selectedCreditTrail.id.slice(-8).toUpperCase()}</p>
                    </div>

                    <div className="p-6">
                      {/* Credit Details */}
                      <div className="bg-purple-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{selectedCreditTrail.material_type === 'Plastic' ? '♻️' : '🔌'}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedCreditTrail.description}</h3>
                            <p className="text-sm text-gray-600">{selectedCreditTrail.weight_kg}kg {selectedCreditTrail.material_type}</p>
                          </div>
                        </div>
                      </div>

                      {/* Trail Timeline */}
                      <div className="space-y-6">
                        <h4 className="font-medium text-gray-900">Complete Digital Trail</h4>

                        {/* Household Pickup */}
                        {selectedCreditTrail.pickups && (
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Home className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">Household Pickup</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                Collected from: {selectedCreditTrail.pickups.pickup_address}
                              </p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(selectedCreditTrail.pickups.created_at).toLocaleDateString()}
                              </p>
                              {selectedCreditTrail.pickups.image_url && (
                                <img
                                  src={selectedCreditTrail.pickups.image_url}
                                  alt="Waste pickup"
                                  className="mt-2 w-24 h-24 object-cover rounded-lg border"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Processing */}
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Recycle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">Recycling Processed</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Material verified and processed for EPR credit generation
                            </p>
                          </div>
                        </div>

                        {/* Credit Generated */}
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">EPR Credit Generated</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Credit created and made available in marketplace
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(selectedCreditTrail.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Company Purchase */}
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">Company Purchase</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Purchased by your company for EPR compliance
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(selectedCreditTrail.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Blockchain Verification */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Blockchain Verified</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          This EPR credit is immutably recorded on the blockchain, ensuring transparency and preventing double-counting.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compliance Reports */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Period
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={reportDateRange.start}
                      onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      value={reportDateRange.end}
                      onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateComplianceReport}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </motion.button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Recent Reports</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Q4 2023 Compliance', date: '2024-01-15' },
                    { name: 'Monthly Summary - Dec', date: '2024-01-01' },
                    { name: 'Annual Report 2023', date: '2023-12-31' }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{report.name}</span>
                      <span className="text-gray-500">{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>View Analytics</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Manage Partners</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Set Goals</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default CompanyDashboard;
