import { useEffect, Suspense } from 'react';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { store } from './store';
import { restoreAuth } from './store/slices/authSlice';
import { updateScreenSize } from './store/slices/uiSlice';

// 导入懒加载页面组件
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  HomePageMUI,
  HeroesPageMUI,
  HeroLibraryPage,
  HeroDetailPageMUI,
  InventoryPage,
  BattlePageMUI,
  BattleStagesPage,
  BattleResultPage,
  CityPageMUI,
  FormationPageMUI,
  SettingsPageMUI,
  HeroTrainingPage,
  EquipmentPage,
  FormationPresetsPage,
  BuildingManagementPage,
  ShopPage,
  RechargePage,
  SkillsPage,
  SummonPage,
  BattleDemoPage,
  preloadCoreRoutes,
} from './router';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/LayoutMUI';
import NotificationSystem from './components/ui/NotificationSystem';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/error/ErrorBoundary';
import GameWebSocketManager from './components/game/GameWebSocketManager';

// PWA Components
import {
  PWAInstallPrompt,
  PWAUpdatePrompt,
} from './components/pwa/PWAInstallPrompt';
import { pwaService } from './services/pwaService';

// Analytics Components
import { AnalyticsProvider } from './components/analytics/AnalyticsProvider';

// 页面转场动画组件
const AnimatedRoutes = () => {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        initial='initial'
        animate='in'
        exit='out'
        variants={pageVariants}
        transition={pageTransition}
        className='w-full'
      >
        <Routes location={location}>
          <Route path='/' element={<Navigate to='/home' replace />} />
          <Route path='/home' element={<HomePageMUI />} />
          <Route path='/heroes' element={<HeroesPageMUI />} />
          <Route path='/heroes/library' element={<HeroLibraryPage />} />
          <Route path='/heroes/:heroId' element={<HeroDetailPageMUI />} />
          <Route path='/heroes/:heroId/training' element={<HeroTrainingPage />} />
          <Route path='/heroes/:heroId/equipment' element={<EquipmentPage />} />
          <Route path='/inventory' element={<InventoryPage />} />
          <Route path='/formation' element={<FormationPageMUI />} />
          <Route path='/formation/presets' element={<FormationPresetsPage />} />
          <Route path='/battle' element={<BattlePageMUI />} />
          <Route path='/battle/stages' element={<BattleStagesPage />} />
          <Route path='/battle/demo' element={<BattleDemoPage />} />
          <Route path='/battle/result' element={<BattleResultPage />} />
          <Route path='/city' element={<CityPageMUI />} />
          <Route path='/city/buildings' element={<BuildingManagementPage />} />
          <Route path='/shop' element={<ShopPage />} />
          <Route path='/recharge' element={<RechargePage />} />
          <Route path='/skills' element={<SkillsPage />} />
          <Route path='/summon' element={<SummonPage />} />
          <Route path='/settings' element={<SettingsPageMUI />} />
          <Route path='*' element={<Navigate to='/home' replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    // 恢复认证状态
    store.dispatch(restoreAuth());

    // 初始化屏幕尺寸
    store.dispatch(updateScreenSize());

    // 预加载核心路由
    preloadCoreRoutes();

    // 初始化PWA服务
    pwaService.init().then(success => {
      if (success) {
        console.log('PWA service initialized successfully');
      }
    });

    // 监听窗口大小变化
    const handleResize = () => {
      store.dispatch(updateScreenSize());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AnalyticsProvider 
          enabled={import.meta.env.MODE !== 'test'}
          config={{
            debug: import.meta.env.DEV,
            batchSize: 20,
            flushInterval: 30000,
          }}
        >
          <Router>
            <div className='App min-h-screen bg-gray-900 text-white'>
              <Routes>
                {/* 公开路由 */}
                <Route path='/login' element={<Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense>} />
                <Route path='/register' element={<Suspense fallback={<LoadingScreen />}><RegisterPage /></Suspense>} />
                <Route path='/forgot-password' element={<Suspense fallback={<LoadingScreen />}><ForgotPasswordPage /></Suspense>} />

                {/* 受保护的路由 */}
                <Route
                  path='/*'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingScreen />}>
                          <AnimatedRoutes />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>

            {/* 全局组件 */}
            <NotificationSystem />
            <LoadingScreen />
            <GameWebSocketManager />

            {/* PWA组件 */}
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            </div>
          </Router>
        </AnalyticsProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
