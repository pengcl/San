import React from 'react';
import { motion } from 'framer-motion';

const InventoryPage: React.FC = () => {
  return (
    <motion.div
      className='space-y-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className='text-2xl font-bold text-white'>背包系统</h1>

      <div className='bg-gray-800 rounded-lg p-8 border border-gray-700 text-center'>
        <div className='text-6xl mb-4'>🎒</div>
        <h2 className='text-xl font-semibold text-white mb-2'>
          背包页面开发中
        </h2>
        <p className='text-gray-400'>此页面将包含物品管理、装备管理等功能</p>
      </div>
    </motion.div>
  );
};

export default InventoryPage;
