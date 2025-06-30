import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAnalytics } from '../../hooks/useAnalytics';
import Button from '../../components/ui/Button';

interface ForgotPasswordForm {
  email: string;
}

interface ResetCodeForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

type FormStep = 'email' | 'code' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { track } = useAnalytics();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [emailForm, setEmailForm] = useState<ForgotPasswordForm>({
    email: '',
  });
  
  const [resetForm, setResetForm] = useState<ResetCodeForm>({
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    track('page_view', { page: 'forgot_password' });
  }, [track]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      track('forgot_password_email_submit', { email: emailForm.email });
      
      // 模拟发送验证码API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟成功响应
      dispatch(
        addNotification({
          type: 'success',
          title: '验证码已发送',
          message: `验证码已发送到 ${emailForm.email}，请查收邮件`,
          duration: 5000,
        })
      );

      setCurrentStep('code');
      setCountdown(60); // 60秒倒计时
      
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '发送失败',
          message: '邮箱地址不存在或网络错误，请检查后重试',
          duration: 5000,
        })
      );
      
      track('forgot_password_email_error', { 
        email: emailForm.email,
        error: 'send_failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      dispatch(
        addNotification({
          type: 'error',
          title: '密码不匹配',
          message: '两次输入的密码不一致，请重新输入',
          duration: 3000,
        })
      );
      return;
    }

    if (resetForm.newPassword.length < 6) {
      dispatch(
        addNotification({
          type: 'error',
          title: '密码太短',
          message: '密码长度至少需要6位字符',
          duration: 3000,
        })
      );
      return;
    }

    setIsLoading(true);

    try {
      track('forgot_password_reset_submit', { 
        email: emailForm.email,
        code_length: resetForm.code.length 
      });
      
      // 模拟重置密码API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟成功响应
      setCurrentStep('success');
      
      track('forgot_password_success', { email: emailForm.email });
      
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '重置失败',
          message: '验证码错误或已过期，请重新获取',
          duration: 5000,
        })
      );
      
      track('forgot_password_reset_error', { 
        email: emailForm.email,
        error: 'invalid_code'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      track('forgot_password_resend_code', { email: emailForm.email });
      
      // 模拟重新发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(
        addNotification({
          type: 'success',
          title: '验证码已重新发送',
          message: '新的验证码已发送到您的邮箱',
          duration: 3000,
        })
      );
      
      setCountdown(60);
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: '发送失败',
          message: '重新发送验证码失败，请稍后重试',
          duration: 3000,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <motion.div
      key="email-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">忘记密码</h2>
        <p className="text-gray-400">输入您的邮箱地址，我们将发送验证码给您</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            邮箱地址
          </label>
          <input
            type="email"
            id="email"
            value={emailForm.email}
            onChange={(e) => setEmailForm({ email: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="请输入邮箱地址"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          发送验证码
        </Button>
      </form>
    </motion.div>
  );

  const renderCodeStep = () => (
    <motion.div
      key="code-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">输入验证码</h2>
        <p className="text-gray-400">
          验证码已发送到 <span className="text-orange-400">{emailForm.email}</span>
        </p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            验证码
          </label>
          <input
            type="text"
            id="code"
            value={resetForm.code}
            onChange={(e) => setResetForm(prev => ({ ...prev, code: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
            placeholder="输入6位验证码"
            maxLength={6}
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">
              {countdown > 0 ? `${countdown}秒后可重新发送` : '验证码有效期10分钟'}
            </span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || isLoading}
              className={`text-sm ${
                countdown > 0 || isLoading
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-orange-400 hover:text-orange-300 cursor-pointer'
              } transition-colors`}
            >
              重新发送
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            新密码
          </label>
          <input
            type="password"
            id="newPassword"
            value={resetForm.newPassword}
            onChange={(e) => setResetForm(prev => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="请输入新密码(至少6位)"
            minLength={6}
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            确认密码
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="请再次输入新密码"
            required
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setCurrentStep('email')}
            className="flex-1"
          >
            返回
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="flex-1"
          >
            重置密码
          </Button>
        </div>
      </form>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <motion.div
        className="text-6xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        ✅
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-2">密码重置成功</h2>
      <p className="text-gray-400 mb-6">
        您的密码已成功重置，现在可以使用新密码登录了
      </p>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            track('forgot_password_goto_login');
            navigate('/login');
          }}
          className="w-full"
        >
          立即登录
        </Button>
        
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            setCurrentStep('email');
            setEmailForm({ email: '' });
            setResetForm({ code: '', newPassword: '', confirmPassword: '' });
          }}
          className="w-full"
        >
          重新开始
        </Button>
      </div>
    </motion.div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'code':
        return renderCodeStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            👑
          </motion.div>
        </div>

        {/* 步骤指示器 */}
        {currentStep !== 'success' && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'email' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${
                currentStep === 'code' ? 'bg-orange-500' : 'bg-gray-600'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'code' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-600 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>
        )}

        {/* 表单内容 */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {getStepContent()}
        </motion.div>

        {/* 返回登录链接 */}
        {currentStep !== 'success' && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/login"
              className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              onClick={() => track('forgot_password_back_to_login')}
            >
              ← 返回登录页面
            </Link>
          </motion.div>
        )}

        {/* 安全提示 */}
        <motion.div
          className="mt-4 p-3 bg-blue-900/50 border border-blue-700 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-blue-300 text-center">
            🔒 为了您的账户安全，验证码仅在10分钟内有效
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;