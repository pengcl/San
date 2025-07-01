import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import { useAppDispatch } from '../../store';
import { login } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useLoginMutation } from '../../store/slices/apiSlice';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginUser, { isLoading, error }] = useLoginMutation();
  const [formData, setFormData] = useState({
    identifier: 'pengcl',
    password: 'zouleyuan',
    rememberMe: true,
  });

  const from = (location.state as any)?.from?.pathname || '/home';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginUser({
        identifier: formData.identifier,
        password: formData.password,
        rememberMe: formData.rememberMe,
      }).unwrap();

      if (result.success && result.data) {
        const { user, token, refreshToken } = result.data;
        
        dispatch(
          login({
            user,
            token,
            refreshToken,
            rememberMe: formData.rememberMe,
          })
        );

        dispatch(
          addNotification({
            type: 'success',
            title: '登录成功',
            message: `欢迎回来，${user.username}！`,
            duration: 3000,
          })
        );

        navigate(from, { replace: true });
      } else {
        throw new Error(result.error?.message || '登录失败');
      }
    } catch (err: any) {
      dispatch(
        addNotification({
          type: 'error',
          title: '登录失败',
          message: err.data?.error?.message || err.message || '网络错误，请重试',
          duration: 5000,
        })
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
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
              登录游戏，征战沙场
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="邮箱或用户名"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              margin="normal"
              required
              autoComplete="username"
              placeholder="testuser3@example.com"
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
              autoComplete="current-password"
              placeholder="123456"
              sx={{ mb: 2 }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="记住我"
              />
              <Link to="/forgot-password" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                忘记密码？
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>

            <Box textAlign="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                还没有账户？{' '}
                <Link to="/register" style={{ color: '#ff6b35', textDecoration: 'none' }}>
                  立即注册
                </Link>
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 测试账户：pengcl / zouleyuan
              </Typography>
            </Alert>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LoginPage;