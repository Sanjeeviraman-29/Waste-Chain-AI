import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Truck, 
  Building2, 
  Shield, 
  Leaf, 
  ArrowRight,
  Users,
  Award,
  Recycle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const roleCards = [
    {
      id: 'household',
      title: 'For Households',
      subtitle: 'Recycle smarter, earn rewards',
      description: 'Schedule pickups, track your impact, and earn green points for sustainable waste management.',
      icon: Home,
      color: 'green',
      path: '/auth/household'
    },
    {
      id: 'collector',
      title: 'For Collectors',
      subtitle: 'Turn collection into income',
      description: 'Accept pickup jobs, scan QR codes, and track your earnings in real-time.',
      icon: Truck,
      color: 'blue',
      path: '/auth/collector'
    },
    {
      id: 'company',
      title: 'For Companies',
      subtitle: 'Meet EPR compliance goals',
      description: 'Purchase EPR credits, track environmental impact, and generate compliance reports.',
      icon: Building2,
      color: 'purple',
      path: '/auth/company'
    },
    {
      id: 'admin',
      title: 'Admin Login',
      subtitle: 'Platform management',
      description: 'Manage users, oversee operations, and monitor platform analytics.',
      icon: Shield,
      color: 'orange',
      path: '/auth/admin'
    }
  ];

  const colorVariants = {
    green: {
      bg: 'from-green-500 to-emerald-600',
      light: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    blue: {
      bg: 'from-blue-500 to-cyan-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    purple: {
      bg: 'from-purple-500 to-violet-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'from-orange-500 to-red-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-8"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            WasteChain AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            The complete waste management ecosystem connecting households, collectors, and companies 
            for a sustainable future powered by AI and blockchain technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-8 text-sm text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Recycle className="w-4 h-4" />
              <span>50,000 kg Recycled</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>EPR Compliant</span>
            </div>
          </motion.div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            const colors = colorVariants[card.color as keyof typeof colorVariants];
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                {/* Card Header with Gradient */}
                <div className={`h-32 bg-gradient-to-r ${colors.bg} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <motion.div
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  <p className={`text-sm font-medium ${colors.text} mb-3`}>
                    {card.subtitle}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className={`px-6 pb-6 border-t ${colors.border}`}>
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2 px-4 ${colors.light} ${colors.text} rounded-lg font-medium text-sm transition-colors duration-200 hover:bg-opacity-80`}
                    >
                      Get Started
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 text-sm">
            Join the sustainable revolution • Secure • AI-Powered • Blockchain-Verified
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
