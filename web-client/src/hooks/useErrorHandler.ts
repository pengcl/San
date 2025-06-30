import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';
import { logger } from '../utils/logger';

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  notificationTitle?: string;
  logToConsole?: boolean;
  logContext?: string;
}

export const useErrorHandler = () => {
  const dispatch = useDispatch();

  const handleError = useCallback(
    (error: Error | string, options: ErrorHandlerOptions = {}) => {
      const {
        showNotification = true,
        notificationTitle = '发生错误',
        logToConsole = true,
        logContext,
      } = options;

      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorObject = typeof error === 'string' ? new Error(error) : error;

      // Log error
      if (logToConsole) {
        logger.error(errorMessage, errorObject, logContext);
      }

      // Show notification
      if (showNotification) {
        dispatch(
          addNotification({
            type: 'error',
            title: notificationTitle,
            message: errorMessage,
            duration: 5000,
          })
        );
      }
    },
    [dispatch]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error as Error, options);
        return null;
      }
    },
    [handleError]
  );

  const createErrorHandler = useCallback(
    (options: ErrorHandlerOptions = {}) => {
      return (error: Error | string) => handleError(error, options);
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
  };
};

export default useErrorHandler;
