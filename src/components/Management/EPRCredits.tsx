import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  DollarSign,
  Recycle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { supabaseClient } from '../../lib/supabaseClient';

interface EPRCredit {
  id: string;
  credit_amount: number;
  waste_category: string;
  generation_date: string;
  status: 'generated' | 'verified' | 'sold' | 'retired';
  sale_price?: number;
  buyer_company?: string;
  sale_date?: string;
  retirement_date?: string;
  certificate_url?: string;
}

const EPRCredits: React.FC = () => {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<EPRCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<EPRCredit | null>(null);
  const [saleData, setSaleData] = useState({
    buyer_company: '',
    sale_price: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      // Since we don't have an EPR credits table, we'll simulate data based on completed pickups
      const { data: pickups, error } = await supabase
        .from('pickups')
        .select('*')
        .eq('status', 'completed')
        .order('completed_date', { ascending: false });

      if (error) throw error;

      // Transform pickups into EPR credits
      const simulatedCredits: EPRCredit[] = pickups?.map((pickup, index) => ({
        id: `epr-${pickup.id}`,
        credit_amount: (pickup.actual_weight || 0) * 0.1, // 0.1 credit per kg
        waste_category: pickup.waste_category,
        generation_date: pickup.completed_date || pickup.created_at,
        status: ['generated', 'verified', 'sold', 'retired'][index % 4] as any,
        sale_price: index % 4 === 2 ? Math.random() * 100 + 50 : undefined,
        buyer_company: index % 4 === 2 ? ['EcoTech Corp', 'Green Solutions Ltd', 'Sustainable Industries'][index % 3] : undefined,
        sale_date: index % 4 === 2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        retirement_date: index % 4 === 3 ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        certificate_url: `https://certificates.wastechain.ai/${pickup.id}.pdf`
      })) || [];

      setCredits(simulatedCredits);
    } catch (error) {
      console.error('Error fetching EPR credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordSale = async () => {
    if (!selectedCredit) return;

    try {
      // In a real implementation, this would update the EPR credits table
      const updatedCredits = credits.map(credit => 
        credit.id === selectedCredit.id 
          ? { 
              ...credit, 
              status: 'sold' as const,
              ...saleData
            }
          : credit
      );
      
      setCredits(updatedCredits);
      setShowSaleModal(false);
      setSelectedCredit(null);
      setSaleData({
        buyer_company: '',
        sale_price: 0,
        sale_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };

  const filteredCredits = credits.filter(credit => {
    const matchesSearch = credit.waste_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.buyer_company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-purple-100 text-purple-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return Clock;
      case 'verified': return CheckCircle;
      case 'sold': return DollarSign;
      case 'retired': return XCircle;
      default: return Clock;
    }
  };

  const totalCredits = credits.reduce((sum, credit) => sum + credit.credit_amount, 0);
  const totalRevenue = credits.filter(c => c.status === 'sold').reduce((sum, credit) => sum + (credit.sale_price || 0), 0);
  const verifiedCredits = credits.filter(c => c.status === 'verified').length;
  const soldCredits = credits.filter(c => c.status === 'sold').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">EPR Credits Management</h2>
          <p className="text-gray-600 mt-1">
            Track and manage Extended Producer Responsibility credits lifecycle
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Credits',
            value: totalCredits.toFixed(2),
            icon: Recycle,
            color: 'green'
          },
          {
            title: 'Verified Credits',
            value: verifiedCredits.toString(),
            icon: CheckCircle,
            color: 'blue'
          },
          {
            title: 'Credits Sold',
            value: soldCredits.toString(),
            icon: DollarSign,
            color: 'purple'
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            icon: TrendingUp,
            color: 'orange'
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

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by waste category or buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="generated">Generated</option>
            <option value="verified">Verified</option>
            <option value="sold">Sold</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Credits Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            EPR Credits ({filteredCredits.length} records)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Info
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
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredCredits.map((credit) => {
                  const StatusIcon = getStatusIcon(credit.status);
                  return (
                    <motion.tr
                      key={credit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-600">
                          {credit.id.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-gray-900">
                          {credit.credit_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {credit.waste_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credit.status)}`}>
                            {credit.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {credit.status === 'sold' ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">${credit.sale_price?.toFixed(2)}</div>
                            <div className="text-gray-500">{credit.buyer_company}</div>
                            <div className="text-gray-400">{credit.sale_date}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {credit.status === 'verified' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedCredit(credit);
                                setShowSaleModal(true);
                              }}
                              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-xs"
                            >
                              Record Sale
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(credit.certificate_url, '_blank')}
                            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                          >
                            <FileText className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Recording Modal */}
      {showSaleModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Record Credit Sale
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Credit ID: {selectedCredit.id}</div>
              <div className="text-lg font-bold text-green-600">
                Amount: {selectedCredit.credit_amount.toFixed(2)} credits
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Company
                </label>
                <input
                  type="text"
                  value={saleData.buyer_company}
                  onChange={(e) => setSaleData(prev => ({ ...prev, buyer_company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter buyer company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={saleData.sale_price}
                  onChange={(e) => setSaleData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={saleData.sale_date}
                  onChange={(e) => setSaleData(prev => ({ ...prev, sale_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={recordSale}
                disabled={!saleData.buyer_company || saleData.sale_price <= 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Record Sale
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSaleModal(false);
                  setSelectedCredit(null);
                  setSaleData({
                    buyer_company: '',
                    sale_price: 0,
                    sale_date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default EPRCredits;
