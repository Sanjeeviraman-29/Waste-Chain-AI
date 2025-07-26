import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Award,
  Leaf,
  Building,
  Users,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

const ReportsView: React.FC = () => {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState('epr-compliance');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });

  const reportTypes = [
    {
      id: 'epr-compliance',
      title: 'EPR Compliance Report',
      description: 'Extended Producer Responsibility compliance documentation',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 'environmental-impact',
      title: 'Environmental Impact Assessment',
      description: 'Carbon footprint and environmental benefits analysis',
      icon: Leaf,
      color: 'emerald'
    },
    {
      id: 'waste-audit',
      title: 'Waste Collection Audit',
      description: 'Comprehensive waste collection performance audit',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 'collector-performance',
      title: 'Collector Performance Report',
      description: 'Individual and team performance metrics',
      icon: Users,
      color: 'purple'
    }
  ];

  const complianceMetrics = {
    totalWasteProcessed: 12450,
    recyclingRate: 78.5,
    complianceScore: 94.2,
    carbonSaved: 2340,
    energySaved: 18500,
    wasteRedirection: 89.3
  };

  const generateReport = (reportType: string) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('WasteChain AI', 20, 20);
    pdf.setFontSize(16);
    pdf.text(`${reportTypes.find(r => r.id === reportType)?.title}`, 20, 35);
    
    // Date range
    pdf.setFontSize(12);
    pdf.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 20, 50);
    
    // Content based on report type
    if (reportType === 'epr-compliance') {
      pdf.text('EPR COMPLIANCE SUMMARY', 20, 70);
      pdf.text(`Total Waste Processed: ${complianceMetrics.totalWasteProcessed} kg`, 20, 85);
      pdf.text(`Recycling Rate: ${complianceMetrics.recyclingRate}%`, 20, 100);
      pdf.text(`Compliance Score: ${complianceMetrics.complianceScore}%`, 20, 115);
      pdf.text(`Carbon Footprint Saved: ${complianceMetrics.carbonSaved} kg CO2`, 20, 130);
      
      pdf.text('REGULATORY COMPLIANCE', 20, 150);
      pdf.text('✓ Waste segregation compliance: 98%', 20, 165);
      pdf.text('✓ Collection frequency adherence: 96%', 20, 180);
      pdf.text('✓ Processing facility compliance: 100%', 20, 195);
      pdf.text('✓ Documentation completeness: 94%', 20, 210);
    }
    
    pdf.save(`${reportType}-${Date.now()}.pdf`);
  };

  const colorVariants = {
    green: 'bg-green-50 text-green-600 border-green-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('reports.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports for compliance and analysis
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? `${colorVariants[report.color as keyof typeof colorVariants]} shadow-md`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg border ${
                  isSelected ? colorVariants[report.color as keyof typeof colorVariants] : 'bg-gray-50 border-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Preview */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.title} Preview
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateReport(selectedReport)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>{t('reports.generate')}</span>
              </motion.button>
            </div>

            {selectedReport === 'epr-compliance' && (
              <div className="space-y-6">
                {/* Compliance Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Compliance Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {complianceMetrics.complianceScore}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Compliance</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {complianceMetrics.recyclingRate}%
                      </div>
                      <div className="text-sm text-gray-600">Recycling Rate</div>
                    </div>
                  </div>
                </div>

                {/* Regulatory Checklist */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Regulatory Compliance</h4>
                  <div className="space-y-2">
                    {[
                      { item: 'Waste segregation compliance', status: 98 },
                      { item: 'Collection frequency adherence', status: 96 },
                      { item: 'Processing facility compliance', status: 100 },
                      { item: 'Documentation completeness', status: 94 }
                    ].map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-gray-700">{check.item}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{check.status}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environmental Impact */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Environmental Impact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-xl font-bold text-emerald-600">
                        {complianceMetrics.carbonSaved}
                      </div>
                      <div className="text-xs text-gray-600">kg CO₂ Saved</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">
                        {complianceMetrics.energySaved}
                      </div>
                      <div className="text-xs text-gray-600">kWh Saved</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {complianceMetrics.wasteRedirection}%
                      </div>
                      <div className="text-xs text-gray-600">Waste Diverted</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'environmental-impact' && (
              <div className="space-y-6">
                <div className="text-center p-8 bg-green-50 rounded-lg">
                  <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Environmental Benefits
                  </h4>
                  <p className="text-gray-600">
                    Your waste management efforts have saved significant environmental resources
                  </p>
                </div>
                {/* Add more environmental impact content */}
              </div>
            )}

            {selectedReport === 'waste-audit' && (
              <div className="space-y-6">
                <div className="text-center p-8 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Collection Audit Results
                  </h4>
                  <p className="text-gray-600">
                    Comprehensive analysis of waste collection performance
                  </p>
                </div>
              </div>
            )}

            {selectedReport === 'collector-performance' && (
              <div className="space-y-6">
                <div className="text-center p-8 bg-purple-50 rounded-lg">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Team Performance Metrics
                  </h4>
                  <p className="text-gray-600">
                    Individual and team performance analysis
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Reports Generated</span>
                <span className="font-semibold text-gray-900">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Generated</span>
                <span className="font-semibold text-gray-900">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Processing Time</span>
                <span className="font-semibold text-gray-900">3.2 min</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">All regulations met</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Documentation complete</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Minor improvements needed</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Achievement</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Your organization has achieved <strong>Gold Level</strong> EPR compliance!
            </p>
            <div className="text-xs text-gray-600">
              Keep up the excellent work in sustainable waste management.
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsView;