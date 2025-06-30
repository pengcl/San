# Analytics System Documentation

## 概述

分析系统为三国卡牌游戏提供全面的用户行为分析、性能监控和错误追踪功能。系统采用模块化设计，支持实时数据收集、批量发送和离线缓存。

## 核心功能

### 1. 事件追踪 (Event Tracking)

- **页面浏览追踪**: 自动记录页面访问和导航
- **用户交互追踪**: 点击、滚动、表单提交等
- **自定义事件**: 游戏特定事件和业务逻辑事件
- **会话管理**: 用户会话时长和活跃度统计

### 2. 性能监控 (Performance Monitoring)

- **Web Vitals**: LCP、FID、CLS等核心性能指标
- **页面加载性能**: DNS、TCP、SSL、TTFB等网络指标
- **组件渲染性能**: React组件渲染时间统计
- **资源加载监控**: 图片、脚本、样式表加载性能

### 3. 错误追踪 (Error Tracking)

- **JavaScript错误**: 运行时错误和异常
- **Promise拒绝**: 未处理的Promise错误
- **资源加载错误**: 图片、脚本等资源加载失败
- **API请求错误**: 网络请求失败和超时

### 4. 游戏特定分析

- **战斗数据**: 战斗开始/结束、胜负统计、伤害数据
- **英雄系统**: 英雄招募、升级、进化、装备
- **阵容管理**: 阵容保存、加载、战斗使用
- **资源管理**: 资源获得/消耗、商城购买

## 架构设计

### 核心组件

```
AnalyticsManager (单例)
├── 事件队列管理
├── 性能指标收集
├── 错误事件处理
├── 批量数据发送
└── 本地存储管理

AnalyticsProvider (React Context)
├── 全局状态管理
├── 配置管理
└── 组件间通信

React Hooks
├── useAnalytics (基础分析功能)
├── useGameAnalytics (游戏事件)
├── useClickTracking (点击追踪)
├── usePerformanceTracking (性能监控)
└── useUserBehavior (用户行为)
```

### 数据流程

```
用户操作/系统事件
      ↓
   事件收集器
      ↓
   数据预处理
      ↓
   本地队列缓存
      ↓
   批量发送器
      ↓
   分析服务端
```

## 使用指南

### 1. 基础配置

```typescript
import { initAnalytics } from './utils/analytics';

// 初始化分析服务
initAnalytics({
  endpoint: 'https://api.example.com/analytics',
  enabled: true,
  debug: false,
  userId: 'user123',
});
```

### 2. React组件集成

```tsx
import { AnalyticsProvider } from './components/analytics';

function App() {
  return (
    <AnalyticsProvider
      enabled={true}
      config={{
        debug: process.env.NODE_ENV === 'development',
        batchSize: 20,
        flushInterval: 30000,
      }}
    >
      <YourApp />
    </AnalyticsProvider>
  );
}
```

### 3. 事件追踪

```tsx
import { useAnalytics } from './hooks/useAnalytics';

function GameComponent() {
  const { track, trackGameEvent } = useAnalytics();

  const handleBattleStart = () => {
    trackGameEvent('battle_start', {
      battleType: 'pve',
      playerLevel: 25,
      enemyLevel: 30,
    });
  };

  const handleButtonClick = () => {
    track('button_click', {
      button: 'start-battle',
      page: 'battle-preparation',
    });
  };

  return <button onClick={handleButtonClick}>开始战斗</button>;
}
```

### 4. 性能监控

```tsx
import { usePerformanceTracking } from './hooks/useAnalytics';

function ExpensiveComponent() {
  const { trackComponentEvent } = usePerformanceTracking('ExpensiveComponent');

  useEffect(() => {
    const start = performance.now();

    // 执行复杂计算
    doExpensiveCalculation();

    const duration = performance.now() - start;
    trackComponentEvent('expensive_calculation', { duration });
  }, []);

  return <div>复杂组件</div>;
}
```

### 5. 游戏事件分析

```tsx
import { useGameAnalytics } from './hooks/useAnalytics';

function BattleManager() {
  const { trackBattleStart, trackBattleEnd, trackHeroAction } =
    useGameAnalytics();

  const startBattle = battleData => {
    trackBattleStart({
      type: 'pve',
      playerLevel: player.level,
      enemyLevel: enemy.level,
      formation: player.formation,
    });
  };

  const endBattle = result => {
    trackBattleEnd({
      victory: result.victory,
      duration: result.duration,
      damageDealt: result.damageDealt,
      experience: result.experience,
    });
  };

  return <BattleComponent />;
}
```

## API参考

### AnalyticsManager

#### 配置方法

- `configure(config: Partial<AnalyticsConfig>)`: 更新配置
- `setEnabled(enabled: boolean)`: 启用/禁用分析
- `identify(userId: string, traits?: object)`: 用户识别

#### 事件追踪

- `track(eventName: string, properties?: object)`: 自定义事件
- `trackPageView(pageName?: string)`: 页面浏览
- `trackClick(element: string, properties?: object)`: 点击事件
- `trackGameEvent(eventType: string, properties?: object)`: 游戏事件

#### 性能监控

- `trackPerformance(name: string, value: number, unit: string, metadata?: object)`: 性能指标
- `trackError(error: ErrorEvent)`: 错误事件

#### 数据管理

- `flush(): Promise<void>`: 立即发送数据
- `clear()`: 清空队列
- `getSessionInfo()`: 获取会话信息
- `getQueueStatus()`: 获取队列状态

### React Hooks

#### useAnalytics

```typescript
const {
  track,
  trackPageView,
  trackClick,
  trackGameEvent,
  identify,
  analytics,
} = useAnalytics(options);
```

#### useGameAnalytics

```typescript
const {
  trackBattleStart,
  trackBattleEnd,
  trackHeroAction,
  trackResourceChange,
  trackFormationChange,
  trackShopPurchase,
} = useGameAnalytics();
```

#### useClickTracking

```typescript
const handleClick = useClickTracking('button-name', {
  category: 'ui',
  section: 'header',
});

<button onClick={handleClick}>点击我</button>
```

## 数据结构

### 事件数据结构

```typescript
interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'click' | 'custom' | 'error' | 'performance';
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
}
```

### 性能数据结构

```typescript
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  metadata?: Record<string, any>;
}
```

### 错误数据结构

```typescript
interface ErrorEvent {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

## 游戏事件列表

### 战斗事件

- `battle_start`: 战斗开始
- `battle_end`: 战斗结束
- `battle_pause`: 战斗暂停
- `battle_resume`: 战斗恢复

### 英雄事件

- `hero_recruit`: 英雄招募
- `hero_upgrade`: 英雄升级
- `hero_evolve`: 英雄进化
- `hero_equip`: 装备穿戴

### 阵容事件

- `formation_save`: 阵容保存
- `formation_load`: 阵容加载
- `formation_battle`: 阵容战斗

### 资源事件

- `resource_gain`: 资源获得
- `resource_spend`: 资源消耗

### 商城事件

- `shop_view`: 商城浏览
- `shop_purchase`: 商城购买

### UI事件

- `page_view`: 页面浏览
- `button_click`: 按钮点击
- `modal_open`: 弹窗打开
- `modal_close`: 弹窗关闭

## 性能优化

### 数据采样

```typescript
import { shouldSample } from './utils/analytics';

// 10%采样率
if (shouldSample(0.1)) {
  track('expensive_event', data);
}
```

### 批量发送

```typescript
// 配置批量发送参数
analytics.configure({
  batchSize: 50, // 批量大小
  flushInterval: 30000, // 发送间隔(ms)
});
```

### 离线支持

- 网络断开时自动缓存数据
- 网络恢复后自动重新发送
- 使用localStorage持久化重要数据

## 开发工具

### Analytics Dashboard

开发环境下可使用内置的分析面板查看实时数据：

```tsx
import { AnalyticsDashboard } from './components/analytics';

// 仅在开发环境显示
{
  process.env.NODE_ENV === 'development' && <AnalyticsDashboard />;
}
```

### 调试模式

```typescript
analytics.configure({
  debug: true, // 启用控制台日志
});
```

### 数据导出

支持导出分析数据为JSON格式，便于调试和分析。

## 隐私和安全

### 数据脱敏

- 自动移除敏感信息
- 用户ID哈希处理
- 设备指纹匿名化

### 用户控制

- 支持用户选择退出分析
- 遵循GDPR和CCPA规定
- 数据保留期限控制

### 安全传输

- HTTPS加密传输
- 数据压缩减少传输量
- 请求签名验证

## 常见问题

### Q: 如何减少分析对性能的影响？

A:

1. 使用数据采样减少事件数量
2. 配置合适的批量发送参数
3. 避免在关键路径上进行复杂分析

### Q: 如何处理网络异常？

A:

1. 自动重试机制
2. 指数退避算法
3. 离线数据缓存

### Q: 如何自定义事件属性？

A:

```typescript
track('custom_event', {
  category: 'game',
  action: 'level_up',
  value: newLevel,
  metadata: {
    previous_level: oldLevel,
    experience_gained: exp,
  },
});
```

## 更新日志

### v1.0.0

- 初始版本发布
- 基础事件追踪功能
- 性能监控系统
- 错误追踪机制
- React Hooks集成
- 开发者调试工具
