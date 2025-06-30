import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectGlobalLoading } from '../../store/slices/uiSlice';

const LoadingSpinner: React.FC = () => (
  <motion.div
    className='w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full'
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

const LoadingScreen: React.FC = () => {
  const isLoading = useSelector(selectGlobalLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className='flex flex-col items-center space-y-4 p-8 bg-gray-800 rounded-lg border border-gray-700'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <LoadingSpinner />

            <div className='text-center'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                加载中...
              </h3>
              <p className='text-sm text-gray-300'>正在为您准备游戏内容</p>
            </div>

            {/* 装饰性的游戏元素 */}
            <div className='flex space-x-2 mt-4'>
              <motion.span
                className='text-2xl'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              >
                ⚔️
              </motion.span>
              <motion.span
                className='text-2xl'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              >
                🛡️
              </motion.span>
              <motion.span
                className='text-2xl'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
              >
                👑
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
