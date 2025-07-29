import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './i18n';

import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DemoModeNotification from './components/DemoModeNotification';
import StatsWidget from './components/Widgets/StatsWidget';
import ChartWidget from './components/Widgets/ChartWidget';
import InteractiveHeatmap from './components/Widgets/InteractiveHeatmap';
import AnalyticsView from './components/Analytics/AnalyticsView';
import DataExplorerView from './components/DataExplorer/DataExplorerView';
import ReportsView from './components/Reports/ReportsView';
import CollectorManagement from './components/Management/CollectorManagement';
import UserManagement from './components/Management/UserManagement';
import EPRCredits from './components/Management/EPRCredits';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('dashboard.overview')}
              </h2>
              <p className="text-gray-600">
                {t('dashboard.welcome')}, here's your waste management dashboard overview
              </p>
            </div>
            <StatsWidget />
            <InteractiveHeatmap />
          </motion.div>
        );
      
      case 'analytics':
        return <AnalyticsView />;
      
      case 'data-explorer':
        return <DataExplorerView />;
      
      case 'reports':
        return <ReportsView />;
      
      case 'collector-management':
        return <CollectorManagement />;
      
      case 'user-management':
        return <UserManagement />;
      
      case 'epr-credits':
        return <EPRCredits />;
      
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('dashboard.settings')}
              </h2>
              <p className="text-gray-600">
                Configure your dashboard preferences and system settings
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                    <p className="text-sm text-gray-600">Name: {user?.user_metadata?.full_name || 'Admin User'}</p>
                    <p className="text-sm text-gray-600">Email: {user?.email}</p>
                    <p className="text-sm text-gray-600">Role: {user?.role || 'admin'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <button
                      onClick={signOut}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        <DemoModeNotification />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
