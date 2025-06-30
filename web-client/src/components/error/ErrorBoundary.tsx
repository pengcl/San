import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and analytics
    logger.error('React Error Boundary caught an error', { error, errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private renderFallback() {
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-gray-800 rounded-lg p-6 border border-gray-700 text-center'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-bold text-red-400 mb-2'>出现了错误</h1>
          <p className='text-gray-300 mb-4'>
            抱歉，游戏遇到了一个错误。请尝试刷新页面或联系客服。
          </p>

          {/* 开发环境显示错误详情 */}
          {import.meta.env.DEV && this.state.error && (
            <details className='text-left bg-gray-900 p-3 rounded mb-4'>
              <summary className='text-red-400 cursor-pointer mb-2'>
                错误详情 (仅开发环境显示)
              </summary>
              <pre className='text-xs text-gray-400 whitespace-pre-wrap'>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div className='space-x-3'>
            <button
              onClick={this.handleRetry}
              className='px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors'
            >
              重试
            </button>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
