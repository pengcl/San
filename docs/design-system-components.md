# 三国英雄传 - 设计系统组件规范

## 🎨 基础设计令牌 (Design Tokens)

### 颜色系统

#### 主色调
```css
/* 品质颜色 */
--quality-normal: #9E9E9E;     /* 普通 - 灰色 */
--quality-good: #4CAF50;       /* 优秀 - 绿色 */
--quality-rare: #2196F3;       /* 稀有 - 蓝色 */
--quality-epic: #9C27B0;       /* 史诗 - 紫色 */
--quality-legendary: #FF9800;   /* 传说 - 橙色 */
--quality-mythic: #F44336;     /* 神话 - 红色 */

/* 阵营颜色 */
--faction-shu: #4CAF50;        /* 蜀国 - 绿色 */
--faction-wei: #2196F3;        /* 魏国 - 蓝色 */
--faction-wu: #F44336;         /* 吴国 - 红色 */
--faction-qunxiong: #9C27B0;   /* 群雄 - 紫色 */
--faction-yizu: #FF9800;       /* 异族 - 橙色 */

/* 功能颜色 */
--primary: #D4AF37;            /* 主色 - 金色 */
--secondary: #8B4513;          /* 次要 - 棕色 */
--success: #4CAF50;            /* 成功 - 绿色 */
--warning: #FF9800;            /* 警告 - 橙色 */
--error: #F44336;              /* 错误 - 红色 */
--info: #2196F3;               /* 信息 - 蓝色 */

/* 中性颜色 */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* 背景颜色 */
--bg-primary: #1A1A1A;         /* 主背景 */
--bg-secondary: #2D2D2D;       /* 次要背景 */
--bg-card: #3A3A3A;            /* 卡片背景 */
--bg-overlay: rgba(0,0,0,0.8); /* 遮罩背景 */
```

#### 渐变色
```css
/* 品质渐变 */
--gradient-mythic: linear-gradient(135deg, #F44336 0%, #FF6B6B 100%);
--gradient-legendary: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
--gradient-epic: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%);
--gradient-rare: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);

/* 功能渐变 */
--gradient-primary: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
--gradient-success: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
```

### 字体系统

#### 字体族
```css
--font-primary: 'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif;
--font-secondary: 'Roboto', 'Helvetica Neue', sans-serif;
--font-display: 'Ma Shan Zheng', cursive; /* 装饰性中文字体 */
```

#### 字体大小
```css
--text-xs: 12px;     /* 小号文字 */
--text-sm: 14px;     /* 小文字 */
--text-base: 16px;   /* 基础文字 */
--text-lg: 18px;     /* 大文字 */
--text-xl: 20px;     /* 特大文字 */
--text-2xl: 24px;    /* 标题 */
--text-3xl: 30px;    /* 大标题 */
--text-4xl: 36px;    /* 超大标题 */
```

#### 字重
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 间距系统
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

### 圆角系统
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### 阴影系统
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
--shadow-glow: 0 0 20px rgba(212,175,55,0.5); /* 金色光晕 */
```

## 🧩 基础组件

### 1. 按钮组件 (Button)

#### 主要按钮
```
尺寸：
- 小号：32px 高度，12px 内边距
- 中号：40px 高度，16px 内边距
- 大号：48px 高度，20px 内边距

状态：
- 默认：金色渐变背景
- 悬停：亮度增加 10%
- 按下：缩放 0.95
- 禁用：灰色背景，50% 透明度

文字：
- 颜色：白色
- 字重：600
- 大小：根据按钮尺寸调整
```

#### 次要按钮
```
背景：透明
边框：2px 金色边框
文字：金色
悬停：金色背景，白色文字
```

#### 危险按钮
```
背景：红色渐变
文字：白色
用于：删除、重置等危险操作
```

### 2. 输入框组件 (Input)

#### 文本输入框
```
尺寸：
- 高度：40px
- 内边距：12px 16px
- 边框：1px 灰色边框
- 圆角：8px

状态：
- 默认：灰色边框
- 聚焦：金色边框，金色阴影
- 错误：红色边框，红色阴影
- 禁用：灰色背景

标签：
- 位置：输入框上方
- 字体：14px，字重 500
- 颜色：深灰色
```

### 3. 卡片组件 (Card)

#### 基础卡片
```
背景：深色背景
边框：1px 灰色边框
圆角：12px
阴影：中等阴影
内边距：16px
```

#### 武将卡片
```
尺寸：120px × 160px（移动端）
      150px × 200px（桌面端）

结构：
- 头像区域：圆形头像，品质边框
- 信息区域：姓名、等级、星级
- 底部区域：战力、阵营图标

品质边框：
- 普通：2px 灰色边框
- 优秀：2px 绿色边框
- 稀有：2px 蓝色边框 + 微光效果
- 史诗：3px 紫色边框 + 光晕效果
- 传说：3px 橙色边框 + 强光晕
- 神话：4px 红色边框 + 炫光效果
```

### 4. 模态框组件 (Modal)

#### 基础模态框
```
背景遮罩：半透明黑色
内容区域：
- 背景：深色卡片背景
- 圆角：16px
- 最大宽度：90vw（移动端），600px（桌面端）
- 内边距：24px

头部：
- 标题：大号字体，字重 600
- 关闭按钮：右上角 X 图标

底部：
- 按钮组：右对齐
- 按钮间距：12px
```

### 5. 导航组件 (Navigation)

#### 底部导航栏
```
高度：60px
背景：深色背景，顶部边框
项目数量：5个

导航项：
- 图标：24px × 24px
- 文字：12px
- 间距：图标与文字 4px
- 激活状态：金色
- 未激活：灰色
```

#### 顶部状态栏
```
高度：56px
背景：深色背景，底部边框

左侧：用户头像 + 等级
中间：页面标题
右侧：资源显示（金币、钻石、体力）
```

## 🎮 游戏专用组件

### 1. 资源显示组件

#### 金币显示
```
图标：金币图标（24px）
数值：数字格式化（如：10.5K）
颜色：金色
背景：深色圆角背景
```

#### 钻石显示
```
图标：钻石图标（24px）
数值：完整数字显示
颜色：蓝色
背景：深色圆角背景
```

#### 体力显示
```
图标：心形图标（24px）
数值：当前/最大值格式
颜色：红色
背景：深色圆角背景
恢复时间：小字显示
```

### 2. 星级显示组件

#### 星级图标
```
图标：五角星
尺寸：16px（小），20px（中），24px（大）
颜色：
- 已点亮：金色
- 未点亮：灰色
排列：水平排列，间距 2px
```

### 3. 进度条组件

#### 经验进度条
```
高度：8px
背景：深灰色
填充：蓝色渐变
圆角：4px
文字：进度百分比（可选）
```

#### 血量进度条
```
高度：12px
背景：深红色
填充：红色到绿色渐变
圆角：6px
动画：平滑过渡
```

### 4. 标签组件

#### 品质标签
```
背景：对应品质颜色
文字：白色
圆角：4px
内边距：4px 8px
字体：12px，字重 600
```

#### 阵营标签
```
背景：对应阵营颜色
文字：白色
形状：盾牌形状
尺寸：24px × 24px
```

### 5. 特效组件

#### 神话光环
```
效果：旋转光环动画
颜色：金色渐变
持续时间：3秒循环
透明度：0.7
```

#### 升级特效
```
效果：从中心向外扩散的光芒
颜色：金色
持续时间：1秒
缓动：ease-out
```

## 📱 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) {
  /* 单列布局 */
  /* 大号触摸目标 */
  /* 简化界面元素 */
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 两列布局 */
  /* 侧边栏导航 */
  /* 更多信息展示 */
}

/* 桌面端 */
@media (min-width: 1024px) {
  /* 多列布局 */
  /* 悬停效果 */
  /* 完整功能展示 */
}
```

## 🎨 动画规范

### 过渡动画
```css
/* 标准过渡 */
.transition-standard {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 快速过渡 */
.transition-fast {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 慢速过渡 */
.transition-slow {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 关键帧动画
```css
/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 旋转动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

## 🔧 使用指南

### 组件命名规范
```
组件名称：PascalCase（如：HeroCard）
属性名称：camelCase（如：heroData）
 CSS类名：kebab-case（如：hero-card）
```

### 组件文件结构
```
components/
├── base/           # 基础组件
│   ├── Button/
│   ├── Input/
│   └── Card/
├── game/           # 游戏专用组件
│   ├── HeroCard/
│   ├── ResourceDisplay/
│   └── QualityBadge/
└── layout/         # 布局组件
    ├── Header/
    ├── Navigation/
    └── Sidebar/
```

### 设计令牌使用
```css
/* 推荐：使用设计令牌 */
.hero-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
}

/* 不推荐：硬编码值 */
.hero-card {
  background: #3A3A3A;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

**备注**：本组件规范基于现代Web标准和最佳实践制定，确保组件的可复用性、可维护性和一致性。设计师和开发者应严格遵循此规范进行设计和开发工作。