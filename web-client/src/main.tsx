import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/muiTheme';
import './index.css';
import App from './App.tsx';
import { initAnalytics, autoTrackPagePerformance } from './utils/analytics';

// 初始化分析服务
initAnalytics({
  enabled: import.meta.env.MODE !== 'test',
  debug: import.meta.env.DEV,
});

// 自动追踪页面性能
autoTrackPagePerformance();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
