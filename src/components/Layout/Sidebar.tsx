import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Map, 
  FileText, 
  Settings, 
  Leaf,
  Award,
  TrendingUp,
  Users,
  Truck,
  Coins
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'overview', label: t('dashboard.overview'), icon: BarChart3 },
    { id: 'analytics', label: t('dashboard.analytics'), icon: TrendingUp },
    { id: 'data-explorer', label: t('widgets.dataExplorer'), icon: Map },
    { id: 'reports', label: t('dashboard.reports'), icon: FileText },
    { id: 'collector-management', label: 'Collector Management', icon: Truck },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'epr-credits', label: 'EPR Credits', icon: Coins },
    { id: 'settings', label: t('dashboard.settings'), icon: Settings }
  ];

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-70 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WasteChain</h1>
            <p className="text-sm text-gray-500">AI Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-2 h-2 bg-green-500 rounded-full"
                    />
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Stats */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Award className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Green Points</p>
              <p className="text-2xl font-bold text-green-600">2,450</p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;