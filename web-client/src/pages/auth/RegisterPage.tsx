import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import { useAppDispatch } from '../../store';
import { login } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useRegisterMutation } from '../../store/slices/apiSlice';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading, error }] = useRegisterMutation();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // 清除对应字段的错误
    if (formErrors[name as keyof RegisterFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {};

    if (!formData.username.trim()) {
      errors.username = '用户名不能为空';
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
    } else if (formData.username.length > 20) {
      errors.username = '用户名不能超过20个字符';
    }

    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '邮箱格式不正确';
    }

    if (!formData.password) {
      errors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      errors.password = '密码至少需要6个字符';
    } else if (formData.password.length > 50) {
      errors.password = '密码不能超过50个字符';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = '请同意用户协议' as any;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    
    if (score < 50) return { score, text: '弱', color: 'error' };
    if (score < 75) return { score, text: '中等', color: 'warning' };
    return { score, text: '强', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      if (result.success && result.data) {
        const { user, token, refreshToken } = result.data;
        
        dispatch(
          login({
            user,
            token,
            refreshToken,
            rememberMe: true,
          })
        );

        dispatch(
          addNotification({
            type: 'success',
            title: '注册成功',
            message: `欢迎加入三国英雄传，${user.username}！已为您分配初始武将。`,
            duration: 5000,
          })
        );

        navigate('/home', { replace: true });
      } else {
        throw new Error(result.error?.message || '注册失败');
      }
    } catch (err: any) {
      dispatch(
        addNotification({
          type: 'error',
          title: '注册失败',
          message: err.data?.error?.message || err.message || '网络错误，请重试',
          duration: 5000,
        })
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Paper 
          elevation={10} 
          sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: 3
          }}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom color="primary" fontFamily="Cinzel">
              三国英雄传
            </Typography>
            <Typography variant="h6" color="text.secondary">
              注册账号，开始征战
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="username"
              placeholder="3-20个字符"
              error={!!formErrors.username}
              helperText={formErrors.username}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="邮箱"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="email"
              placeholder="your@example.com"
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="new-password"
              placeholder="至少6个字符"
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ mb: 1 }}
            />

            {formData.password && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  密码强度: {passwordStrength.text}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.score}
                  color={passwordStrength.color as any}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="确认密码"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="new-password"
              placeholder="再次输入密码"
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  我已阅读并同意{' '}
                  <Link to="/terms" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                    用户协议
                  </Link>
                  {' '}和{' '}
                  <Link to="/privacy" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                    隐私政策
                  </Link>
                </Typography>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            {formErrors.agreeToTerms && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.agreeToTerms}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isLoading ? '注册中...' : '立即注册'}
            </Button>

            <Box textAlign="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                已有账户？{' '}
                <Link to="/login" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                  立即登录
                </Link>
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                🎮 注册即可获得桃园三结义（刘备、关羽、张飞）组合！
              </Typography>
            </Alert>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default RegisterPage;
