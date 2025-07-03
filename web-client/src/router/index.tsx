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
  () => import('../pages/game/HeroDetailPageMUI')
);
export const HeroDetailPageMUI = lazy(() => import('../pages/game/HeroDetailPageMUI'));
export const InventoryPage = lazy(() => import('../pages/game/InventoryPageMUI'));
export const BattlePage = lazy(() => import('../pages/game/BattlePage'));
export const BattlePageMUI = lazy(() => import('../pages/game/BattlePageMUI'));
export const BattleStagesPage = lazy(() => import('../pages/game/BattleStagesPage'));
export const BattleResultPage = lazy(() => import('../pages/game/BattleResultPage'));
export const CityPage = lazy(() => import('../pages/game/CityPage'));
export const CityPageMUI = lazy(() => import('../pages/game/CityPageMUI'));
export const FormationPage = lazy(() => import('../pages/game/FormationPage'));
export const FormationPageMUI = lazy(() => import('../pages/game/FormationPageMUI'));
export const SettingsPage = lazy(() => import('../pages/game/SettingsPage'));
export const SettingsPageMUI = lazy(() => import('../pages/game/SettingsPageMUI'));
export const HeroTrainingPage = lazy(() => import('../pages/game/HeroTrainingPageMUI'));
export const EquipmentPage = lazy(() => import('../pages/game/EquipmentPage'));
export const FormationPresetsPage = lazy(() => import('../pages/game/FormationPresetsPage'));
export const BuildingManagementPage = lazy(() => import('../pages/game/BuildingManagementPageMUI'));
export const ShopPage = lazy(() => import('../pages/game/ShopPage'));
export const RechargePage = lazy(() => import('../pages/game/RechargePage'));
export const SkillsPage = lazy(() => import('../pages/game/SkillsPageMUI'));
export const SummonPage = lazy(() => import('../pages/game/SummonPageMUI'));
export const BattleDemoPage = lazy(() => import('../pages/game/BattleDemoPage'));
export const GameMapPage = lazy(() => import('../pages/GameMapPage'));
export const ThreeKingdomsMapPage = lazy(() => import('../pages/ThreeKingdomsMapPage'));
export const ThreeKingdoms3DMapPage = lazy(() => import('../pages/ThreeKingdoms3DMapPage'));
export const PixelArtMapPage = lazy(() => import('../pages/PixelArtMapPage'));
export const StrategicBoardMapPage = lazy(() => import('../pages/StrategicBoardMapPage'));
export const TiledMapPage = lazy(() => import('../pages/TiledMapPage'));
export const IsometricMapPage = lazy(() => import('../pages/IsometricMapPage'));
export const CityManagePage = lazy(() => import('../pages/CityManagePage'));

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
  CityPageMUI,
  FormationPage,
  FormationPageMUI,
  SettingsPage,
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
  GameMapPage,
  ThreeKingdomsMapPage,
  ThreeKingdoms3DMapPage,
  PixelArtMapPage,
  StrategicBoardMapPage,
  TiledMapPage,
  IsometricMapPage,
  CityManagePage,
};

export default {
  routeComponents,
  preloadCoreRoutes,
};
