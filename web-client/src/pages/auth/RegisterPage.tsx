import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <motion.div
        className='w-full max-w-md text-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='bg-gray-800 rounded-lg p-8 border border-gray-700'>
          <h1 className='text-2xl font-bold text-white mb-4'>注册页面</h1>
          <p className='text-gray-400 mb-6'>此页面正在开发中...</p>

          <Link
            to='/login'
            className='inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'
          >
            返回登录
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
