import { lazy } from 'react';

// 懒加载页面组件
export const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
export const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
export const HomePage = lazy(() => import('../pages/game/HomePage'));
export const HomePageMUI = lazy(() => import('../pages/game/HomePageMUI'));
export const HeroesPage = lazy(() => import('../pages/game/HeroesPage'));
export const HeroesPageMUI = lazy(() => import('../pages/game/HeroesPageMUI'));
export const HeroLibraryPage = lazy(() => import('../pages/game/HeroLibraryPage'));
export const HeroDetailPage = lazy(
  () => import('../pages/game/HeroDetailPage')
);
export const InventoryPage = lazy(() => import('../pages/game/InventoryPage'));
export const BattlePage = lazy(() => import('../pages/game/BattlePage'));
export const BattlePageMUI = lazy(() => import('../pages/game/BattlePageMUI'));
export const BattleStagesPage = lazy(() => import('../pages/game/BattleStagesPage'));
export const BattleResultPage = lazy(() => import('../pages/game/BattleResultPage'));
export const CityPage = lazy(() => import('../pages/game/CityPage'));
export const FormationPage = lazy(() => import('../pages/game/FormationPage'));
export const FormationPageMUI = lazy(() => import('../pages/game/FormationPageMUI'));
export const SettingsPage = lazy(() => import('../pages/game/SettingsPage'));
export const HeroTrainingPage = lazy(() => import('../pages/game/HeroTrainingPage'));
export const EquipmentPage = lazy(() => import('../pages/game/EquipmentPage'));
export const FormationPresetsPage = lazy(() => import('../pages/game/FormationPresetsPage'));
export const BuildingManagementPage = lazy(() => import('../pages/game/BuildingManagementPage'));
export const ShopPage = lazy(() => import('../pages/game/ShopPage'));
export const RechargePage = lazy(() => import('../pages/game/RechargePage'));

// 路由元数据类型
export interface RouteMetadata {
  title: string;
  description?: string;
  requiresAuth: boolean;
  preload?: boolean;
}

// 预加载核心路由
export const preloadCoreRoutes = () => {
  // 预加载核心路由组件
  setTimeout(() => {
    import('../pages/game/HomePage').catch(console.error);
    import('../pages/game/HeroesPage').catch(console.error);
  }, 100);
};

// 路由组件映射
export const routeComponents = {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  HomePage,
  HeroesPage,
  HeroesPageMUI,
  HeroLibraryPage,
  HeroDetailPage,
  InventoryPage,
  BattlePage,
  BattleStagesPage,
  BattleResultPage,
  CityPage,
  FormationPage,
  FormationPageMUI,
  SettingsPage,
  HeroTrainingPage,
  EquipmentPage,
  FormationPresetsPage,
  BuildingManagementPage,
  ShopPage,
  RechargePage,
};

export default {
  routeComponents,
  preloadCoreRoutes,
};
