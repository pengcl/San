import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  selectNotifications,
  removeNotification,
} from '../../store/slices/uiSlice';
import type { Notification } from '../../types';

const NotificationItem: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, dispatch]);

  const getNotificationStyles = (type: Notification['type']) => {
    const styles = {
      success: 'bg-green-600 border-green-500',
      error: 'bg-red-600 border-red-500',
      warning: 'bg-yellow-600 border-yellow-500',
      info: 'bg-blue-600 border-blue-500',
    };
    return styles[type] || styles.info;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || icons.info;
  };

  const handleClose = () => {
    dispatch(removeNotification(notification.id));
  };

  return (
    <motion.div
      className={`
        relative w-80 p-4 rounded-lg border-l-4 shadow-lg
        ${getNotificationStyles(notification.type)}
        text-white
      `}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      layout
    >
      <div className='flex items-start space-x-3'>
        <span className='text-xl flex-shrink-0 mt-0.5'>
          {getNotificationIcon(notification.type)}
        </span>

        <div className='flex-1 min-w-0'>
          <h4 className='font-semibold text-sm leading-tight'>
            {notification.title}
          </h4>
          {notification.message && (
            <p className='mt-1 text-sm text-gray-100 leading-tight'>
              {notification.message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className='flex-shrink-0 text-gray-200 hover:text-white transition-colors'
        >
          <span className='text-lg'>×</span>
        </button>
      </div>

      {notification.duration && notification.duration > 0 && (
        <motion.div
          className='absolute bottom-0 left-0 h-1 bg-white/30 rounded-b'
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{
            duration: notification.duration / 1000,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  );
};

const NotificationSystem: React.FC = () => {
  const notifications = useSelector(selectNotifications);

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 pointer-events-none'>
      <AnimatePresence mode='popLayout'>
        {notifications.map(notification => (
          <div key={notification.id} className='pointer-events-auto'>
            <NotificationItem notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
