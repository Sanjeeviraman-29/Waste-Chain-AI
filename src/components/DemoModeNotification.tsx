import React from 'react';
import { motion } from 'framer-motion';
import { Info, Database } from 'lucide-react';
import { shouldUseMockData } from '../lib/mockDataService';

const DemoModeNotification: React.FC = () => {
  if (!shouldUseMockData()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mb-4"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Database className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Demo Mode</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This application is running in demo mode with mock data. 
            To connect to a real database, configure your Supabase environment variables.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoModeNotification;
