import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './i18n';

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

function App() {
  const { t } = useTranslation();
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
              <p className="text-gray-500">Settings panel coming soon...</p>
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
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
