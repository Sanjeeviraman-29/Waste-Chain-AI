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
  Shield
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
  material_type: 'Plastic' | 'E-Waste' | 'Paper' | 'Organic';
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

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Starter Package',
      credits: 100,
      price: 15000,
      description: 'Perfect for small businesses starting their EPR journey'
    },
    {
      id: 'professional',
      name: 'Professional Package',
      credits: 500,
      price: 65000,
      description: 'Ideal for medium-sized companies with regular waste generation',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Package',
      credits: 1000,
      price: 120000,
      description: 'Comprehensive solution for large corporations'
    },
    {
      id: 'custom',
      name: 'Custom Package',
      credits: 0,
      price: 0,
      description: 'Tailored solution based on your specific requirements'
    }
  ];

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

  const handlePurchaseCredits = async () => {
    try {
      setIsLoading(true);

      const credits = selectedPackage?.id === 'custom' 
        ? parseInt(purchaseForm.credits) 
        : selectedPackage?.credits || 0;
      
      const amount = selectedPackage?.id === 'custom'
        ? credits * 150 // ₹150 per credit for custom
        : selectedPackage?.price || 0;

      const transactionData = {
        company_id: user?.id,
        credits_purchased: credits,
        amount_paid: amount,
        transaction_date: new Date().toISOString(),
        status: 'completed',
        package_type: selectedPackage?.name
      };

      if (supabase && isSupabaseAvailable()) {
        const { data, error } = await supabase
          .from('epr_transactions')
          .insert([transactionData])
          .select()
          .single();

        if (error) throw error;
        console.log('EPR credits purchased successfully:', data);
      } else {
        // Mock transaction
        const mockTransaction: EPRTransaction = {
          id: Date.now().toString(),
          ...transactionData,
          transaction_date: new Date().toISOString()
        };
        setTransactions(prev => [mockTransaction, ...prev]);
      }

      // Update stats
      setCompanyStats(prev => ({
        ...prev,
        totalEPRCredits: prev.totalEPRCredits + credits,
        monthlySpend: prev.monthlySpend + amount
      }));

      // Reset form and close modal
      setPurchaseForm({ credits: '', customAmount: false });
      setSelectedPackage(null);
      setShowPurchaseModal(false);
      
      alert(`Successfully purchased ${credits} EPR credits for ₹${amount.toLocaleString()}`);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('Error purchasing credits. Please try again.');
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
    doc.text(`Company: ${user?.user_metadata?.company_name || 'Demo Company'}`, 20, 35);
    doc.text(`Report Period: ${reportDateRange.start} to ${reportDateRange.end}`, 20, 45);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Stats
    doc.setFontSize(16);
    doc.text('Compliance Summary', 20, 75);
    
    doc.setFontSize(12);
    doc.text(`Total Waste Recycled: ${companyStats.totalWasteRecycled.toLocaleString()} kg`, 20, 90);
    doc.text(`Total EPR Credits: ${companyStats.totalEPRCredits.toLocaleString()}`, 20, 100);
    doc.text(`Compliance Score: ${companyStats.complianceScore}%`, 20, 110);
    doc.text(`Carbon Footprint Reduced: ${companyStats.carbonFootprintReduced} tonnes CO2`, 20, 120);
    doc.text(`Active Waste Management Partners: ${companyStats.activePartners}`, 20, 130);
    
    // Transactions
    doc.setFontSize(16);
    doc.text('Recent Transactions', 20, 150);
    
    let yPos = 165;
    transactions.slice(0, 5).forEach((transaction, index) => {
      doc.setFontSize(10);
      doc.text(
        `${new Date(transaction.transaction_date).toLocaleDateString()} - ${transaction.credits_purchased} credits - ₹${transaction.amount_paid.toLocaleString()}`, 
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
            {/* Purchase EPR Credits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Purchase EPR Credits</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Stay compliant with Extended Producer Responsibility regulations
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPurchaseModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Credits</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditPackages.slice(0, 3).map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      pkg.popular 
                        ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowPurchaseModal(true);
                    }}
                  >
                    {pkg.popular && (
                      <div className="text-center mb-2">
                        <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        {pkg.credits} <span className="text-sm text-gray-600">credits</span>
                      </p>
                      <p className="text-gray-900 font-medium mt-1">₹{pkg.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-600 mt-2">{pkg.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <p className="text-gray-600 text-sm mt-1">Track your EPR credit purchases</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{transaction.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-purple-500 mr-2" />
                            <span className="font-medium text-gray-900">{transaction.credits_purchased}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{transaction.amount_paid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
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

      {/* Purchase Credits Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase EPR Credits</h2>
                
                {selectedPackage ? (
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{selectedPackage.name}</h3>
                      {selectedPackage.id !== 'custom' ? (
                        <>
                          <p className="text-purple-600 text-xl font-bold mt-1">
                            {selectedPackage.credits} credits
                          </p>
                          <p className="text-gray-900 font-medium">₹{selectedPackage.price.toLocaleString()}</p>
                        </>
                      ) : (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Credits
                          </label>
                          <input
                            type="number"
                            value={purchaseForm.credits}
                            onChange={(e) => setPurchaseForm(prev => ({ ...prev, credits: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter number of credits"
                          />
                          {purchaseForm.credits && (
                            <p className="text-purple-600 font-medium mt-2">
                              Total: ₹{(parseInt(purchaseForm.credits) * 150).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-gray-600 text-sm mt-2">{selectedPackage.description}</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Demo Mode</span>
                      </div>
                      <p className="text-blue-700 text-sm mt-1">
                        This is a demo transaction. No actual payment will be processed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {creditPackages.map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-purple-300 ${
                          pkg.popular ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                        <h3 className="font-medium text-gray-900 mt-2">{pkg.name}</h3>
                        {pkg.id !== 'custom' ? (
                          <>
                            <p className="text-purple-600 font-bold">{pkg.credits} credits</p>
                            <p className="text-gray-900">₹{pkg.price.toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-gray-600">Custom amount</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-3 mt-6">
                  {selectedPackage ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePurchaseCredits}
                        disabled={isLoading || (selectedPackage.id === 'custom' && !purchaseForm.credits)}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Purchase</span>
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(null)}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        Back
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPurchaseModal(false)}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyDashboard;
