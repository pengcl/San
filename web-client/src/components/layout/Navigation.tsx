import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavigationProps {
  isMobile?: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/home', label: '主页', icon: '🏠' },
  { path: '/heroes', label: '武将', icon: '⚔️' },
  { path: '/formation', label: '阵容', icon: '🛡️' },
  { path: '/inventory', label: '背包', icon: '🎒' },
  { path: '/battle', label: '战斗', icon: '⚡' },
  { path: '/city', label: '城池', icon: '🏰' },
];

const Navigation: React.FC<NavigationProps> = ({ isMobile = false }) => {
  const location = useLocation();

  const navClass = isMobile
    ? 'flex justify-around items-center h-16 px-4'
    : 'flex flex-col p-4 space-y-2';

  const itemClass = isMobile
    ? 'flex flex-col items-center justify-center flex-1 py-2'
    : 'flex items-center w-full px-4 py-3 rounded-lg transition-colors';

  return (
    <nav className={navClass}>
      {navItems.map(item => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive: linkIsActive }) =>
              `${itemClass} ${
                linkIsActive || isActive
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <motion.div
              className={`flex ${isMobile ? 'flex-col' : ''} items-center ${
                isMobile ? 'space-y-1' : 'space-x-3'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                {item.icon}
              </span>
              <span
                className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                {item.label}
              </span>
            </motion.div>

            {(isActive || location.pathname === item.path) && (
              <motion.div
                className={`${
                  isMobile
                    ? 'absolute bottom-0 left-0 right-0 h-1 bg-orange-500'
                    : 'absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r'
                }`}
                layoutId='activeIndicator'
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;
