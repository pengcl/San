# 三国卡牌游戏开发规范 - Claude Code 提示词

## 【最高优先级】三国大地图系统开发计划

### 系统概述
将游戏打造成一个真实的三国世界，所有玩家共享同一张大地图。玩家通过占领和发展城池来扩张势力，通过阵营战争来争夺天下。这个地图系统将成为游戏的核心导航和世界观展现方式。

### 核心玩法设计

#### 1. 地图世界观
- 地图尺寸：1000x1000 坐标系统
- 包含历史名城：洛阳、长安、成都、建业、许昌等
- 地形系统：平原、山地、河流、关隘，影响行军和战斗

#### 2. 城池系统
- **主城**：玩家起始城池，不可被攻占，可升级发展
- **NPC城池**：可攻占的历史名城，提供资源加成
- **资源点**：农田、矿山、商路等，提供额外资源

#### 3. 阵营玩法
- 加入条件：玩家等级达到20级
- 阵营任务：每日/每周任务，获得贡献度
- 阵营战争：定期开启，争夺重要城池
- 阵营科技：通过集体贡献解锁增益效果

### 开发任务清单（优先级排序）

#### 第一阶段：基础架构【P0】
1. **拓展 user-city**：添加坐标(x,y)、城池等级、防御值等字段
2. **拓展 faction**：添加领土范围、势力颜色、初始坐标区域等配置
3. **创建 map Content-Type**：定义地图大小、区域划分、地形类型
4. **实现坐标分配API**：玩家注册时基于阵营自动分配主城坐标

#### 第二阶段：地图功能【P1】
5. **地图数据获取API**：返回可视区域内的城池信息（分页加载）
6. **开发大地图前端组件**：Canvas/SVG渲染，Material-UI集成
7. **实现地图交互**：缩放、拖拽、城池点击、触控手势

#### 第三阶段：系统集成【P2】
8. **导航系统改造**：地图作为游戏主界面，整合所有功能入口
9. **城池交互功能**：查看详情、发起攻击、资源采集
10. **小地图组件**：快速定位和导航

#### 第四阶段：战争系统【P3】
11. **攻城基础机制**：部队调遣、战斗计算、城池占领
12. **资源产出系统**：基于城池和建筑的资源生成
13. **阵营战争**：战争宣告、领土变更、战功奖励

### 坐标分配规则
- **魏国**：地图北部（y > 700，x: 200-800）
- **蜀国**：地图西南（x < 300，y < 500）
- **吴国**：地图东南（x > 700，y < 500）
- **群雄**：地图中部（其他区域）
- **保护机制**：新玩家主城与现有主城至少保持10个坐标单位距离

### 技术实现要求
- 必须使用 Material-UI 组件体系
- 所有地图数据通过真实 API 获取，禁止硬编码
- 支持移动端触控操作（缩放、拖拽）
- 性能优化：虚拟滚动、按需渲染、缓存策略
- WebSocket 实时更新战争状态和领土变化

### 当前任务状态
所有任务已创建并标记为高优先级，请按照以下顺序执行：
1. 先完成后端数据模型拓展（user-city、faction、map）
2. 实现坐标分配和地图数据API
3. 开发前端地图组件和交互功能
4. 最后实现战争和资源系统

---

## 项目概述

这是一个三国题材的卡牌游戏项目《三国英雄传》，使用 React (TypeScript) + @mui/material + Strapi v5 开发。项目已建立完整的开发标准和规范，所有开发必须严格遵循这些标准。

**【关键设计要求】这是一个手机端卡牌游戏，必须严格遵循以下移动端优先原则：**

1. **移动端优先（Mobile First）**：手机端为主要客户端，所有功能和内容必须在手机端完整呈现
2. **竖屏模式设计**：必须按照手机竖屏模式设计开发，所有UI组件和布局都必须适配手机竖屏视口
3. **内容完整性**：禁止在手机端删减任何功能、按钮或内容，所有桌面端功能都必须在手机端可访问
4. **触控优化**：所有交互元素必须适配触控操作，按钮大小符合触控标准（最小44px）
5. **响应式适配顺序**：设计顺序为 手机端(xs) → 平板端(sm) → 桌面端(md+)，而非桌面端向下适配

**重要：开发前必须阅读游戏设计文档 `docs/game-design-document.md` 了解完整的游戏设计和功能规划。**

## 项目结构

```
├── server/              # Strapi v5 后端
├── web-client/          # React 前端 (Vite + TypeScript)
├── api-specs/           # API规范文件（必读）
│   ├── auth-apis.json      # 认证相关API
│   ├── hero-apis.json      # 武将相关API
│   ├── battle-apis.json    # 战斗相关API
│   ├── resource-apis.json  # 资源相关API
│   └── social-apis.json    # 社交相关API
├── game-rules/          # 游戏规则配置（必读）
│   ├── core-mechanics.json     # 核心机制
│   ├── battle-system.json      # 战斗系统
│   ├── hero-system.json        # 武将系统
│   ├── resource-system.json    # 资源系统
│   └── progression-system.json # 进度系统
├── types/               # 类型定义（必用）
│   ├── game-types.ts        # 统一数据类型
│   └── api-client.ts        # API客户端
└── docs/                # 文档
    ├── api-usage-guide.md      # 开发指南
    ├── game-design-document.md # 游戏设计文档（GDD）
    ├── quick-reference.md      # 快速参考
    ├── implementation-example.md # 实现示例
    └── development-tasks.md    # 开发任务追踪
```

## 开发规范（重要）

### 1. 开发前必读

在实现任何功能前，你必须：
1. **理解** `docs/game-design-document.md` 中的游戏设计和功能需求
2. **查阅** `game-rules/` 中对应的游戏规则配置
3. **参考** `api-specs/` 中对应的API规范
4. **使用** `types/game-types.ts` 中的类型定义
5. **遵循** `docs/api-usage-guide.md` 中的开发指南

### 1.1 【强制】真实接口使用规范

**严禁使用模拟数据，必须使用真实接口进行开发：**

**测试账号：**
- 用户名: `pengcl`
- 密码: `zouleyuan`

*注意：用于开发调试，避免每次都创建新账号*

- ❌ **绝对禁止**：创建模拟数据、假接口、静态数据等
- ✅ **必须**：使用真实的 Strapi API 接口
- ✅ **必须**：如果接口不存在，立即创建真实的 API 接口
- ✅ **必须**：前端所有数据来源都必须通过 API 调用获取

**违反此规范的后果**：
- 导致开发与生产环境不一致
- 增加后期集成测试的复杂度
- 造成性能和数据结构问题

**正确的开发流程**：
1. 前端需要数据 → 检查是否有对应的 API
2. 如果没有 API → 立即创建 Strapi API 接口
3. 配置相应的权限和路由(鉴于权限问题经常报错，请考虑使用中间件或者规则来实现，这段话由用户编写，请优化成规范保存于此文件)
4. 前端调用真实 API 获取数据
5. 绝不使用任何形式的模拟数据

### 2. Strapi v5 后端开发标准

#### API 结构标准

为避免在开发过程中出现命名混乱和重复文件，严格遵循以下标准：

##### 1. Content-Type 命名规范

**必须使用单数形式**：
- ✅ 正确：`hero`, `user-hero`, `battle`, `item-template`
- ❌ 错误：`heroes`, `user-heroes`, `battles`, `item-templates`

##### 2. 目录结构标准

```
server/src/api/
├── {content-type-name}/              # Content-Type名称（单数形式）
│   ├── content-types/
│   │   └── {content-type-name}/      # 同名目录
│   │       └── schema.json           # 数据模型定义
│   ├── controllers/
│   │   └── {content-type-name}.ts    # 单数形式控制器
│   ├── routes/
│   │   └── {content-type-name}.ts    # 单数形式路由
│   └── services/
│       └── {content-type-name}.ts    # 单数形式服务
```

##### 3. 控制器文件标准

**每个 Content-Type 只创建一个控制器文件** 例如：
- ✅ 正确：`hero.ts`（包含所有武将相关功能）
- ❌ 错误：同时创建 `hero.ts` 和 `heroes.ts`

##### 4. API 路由标准

```typescript
// 正确的路由定义
export default {
  routes: [
    {
      method: 'GET',
      path: '/heroes',              // 复数路径（REST标准）
      handler: 'hero.find',         // 单数控制器名
    },
    {
      method: 'GET',
      path: '/heroes/:id',
      handler: 'hero.findOne',
    },
    {
      method: 'POST',
      path: '/heroes/:id/level-up',
      handler: 'hero.levelUp',
    },
    {
      method: 'GET',
      path: '/heroes/library',
      handler: 'hero.library',
    }
  ]
};
```

##### 5. 权限配置标准

在 `server/src/index.ts` 中配置权限时，使用 Content-Type 的单数形式：

```typescript
const authenticatedPermissions = [
  // 武将系统权限
  'api::hero.hero.find',
  'api::hero.hero.findOne', 
  'api::hero.hero.levelUp',
  'api::hero.hero.library',
  
  // 用户武将权限
  'api::user-hero.user-hero.find',
  'api::user-hero.user-hero.findOne',
  'api::user-hero.user-hero.update',
];
```

##### 6. 清理重复文件

如发现同一功能存在多个控制器文件（如 `hero.ts` 和 `heroes.ts`），需要：
1. 保留功能更完整的文件
2. 删除重复文件
3. 确保路由正确指向保留的控制器

### 4. Strapi API 配置和权限管理规范

#### 【强制】权限问题解决方案
**鉴于权限配置经常出现问题，今后所有权限问题都使用中间件或规则来实现，而非依赖bootstrap权限配置。**

#### 权限中间件解决方案
对于复杂的权限问题，优先使用以下方案：

1. **自定义中间件**：在 `src/middlewares/` 下创建权限中间件
2. **路由级权限**：在路由配置中直接设置 `auth: false` 或自定义验证
3. **控制器内验证**：在控制器方法内直接检查用户权限

#### 重要说明
**所有 Strapi Content-Type 默认是私有的，必须显式配置权限才能访问。遵循以下规范可避免 403 Forbidden 错误。**

#### A. Content-Type 创建规范

1. **创建 Content-Type**
   ```bash
   # 使用 Strapi CLI 或在 src/api/ 下手动创建
   ├── src/api/[content-type-name]/
   │   ├── content-types/[content-type-name]/schema.json
   │   ├── controllers/[content-type-name].ts
   │   ├── routes/[content-type-name].ts
   │   └── services/[content-type-name].ts
   ```

2. **Schema.json 配置要点**
   ```json
   {
     "kind": "collectionType",
     "collectionName": "table_name",
     "info": {
       "singularName": "content-type-name",
       "pluralName": "content-type-names",
       "displayName": "显示名称"
     },
     "options": {
       "draftAndPublish": false  // 游戏数据通常设为false
     },
     "attributes": {
       // 字段定义
     }
   }
   ```

#### C. 权限命名规范

1. **标准CRUD权限**
   ```
   api::[content-type].[content-type].find        # GET /api/content-types
   api::[content-type].[content-type].findOne     # GET /api/content-types/:id
   api::[content-type].[content-type].create      # POST /api/content-types
   api::[content-type].[content-type].update      # PUT /api/content-types/:id
   api::[content-type].[content-type].delete      # DELETE /api/content-types/:id
   ```

2. **自定义方法权限**
   ```
   api::[content-type].[content-type].[methodName]
   
   # 示例：
   api::hero.hero.levelUp      # POST /api/heroes/:id/level-up
   api::hero.hero.library      # GET /api/heroes/library
   api::battle.battle.start    # POST /api/battles/start
   ```

#### D. JWT 认证配置

1. **JWT 配置** (config/plugins.ts)
   ```typescript
   export default {
     'users-permissions': {
       config: {
         jwt: {
           expiresIn: '1h',
           issuer: 'sanguo-game',
           audience: 'game-client'
         },
         ratelimit: {
           enabled: true,
           max: 5,
           duration: 60000  // 1分钟
         }
       }
     }
   };
   ```

2. **认证中间件**
   ```typescript
   // 在控制器中检查用户权限
   async find(ctx: Context) {
     const user = ctx.state.user;
     if (!user) {
       return ctx.unauthorized('未认证');
     }
     // ... 业务逻辑
   }
   ```

#### E. 调试权限问题

1. **常见错误排查**
   ```bash
   # 403 Forbidden 错误检查清单：
   ☐ 权限是否已在 bootstrap 中配置
   ☐ 用户角色是否正确（authenticated vs public）
   ☐ JWT token 是否有效且未过期
   ☐ 权限名称是否与实际 action 匹配
   ☐ 路由配置是否正确
   ```

2. **权限验证工具**
   ```bash
   # 检查用户权限
   curl -H "Authorization: Bearer <token>" http://localhost:1337/api/user-heroes
   
   # 检查token有效性
   curl -H "Authorization: Bearer <token>" http://localhost:1337/api/auth/me
   ```

#### F. 开发流程检查清单

**每次添加新API时必须执行：**

1. ☐ 创建 Content-Type 和相关文件
3. ☐ 设置正确的路由认证配置
5. ☐ 使用有效 token 测试 API
6. ☐ 验证权限设置正确

### 3. 后端开发规范

#### API实现要求
- **严格遵循** `api-specs/` 中定义的接口格式
- **使用统一** 的响应格式：
  ```json
  {
    "success": boolean,
    "data": any,
    "error": {
      "code": string,
      "message": string
    },
    "meta": {
      "pagination": {...}
    }
  }
  ```
- **实现所有** 定义的参数验证和错误处理
- **参考数据模型** 在每个API规范文件的 `dataModels` 部分

#### 游戏逻辑实现
- **必须基于** `game-rules/` 中的配置文件实现逻辑
- **不要硬编码** 游戏数值，应从配置文件读取
- **示例**：实现武将升级时，使用 `hero-system.json` 中的 `experienceTable`

### 3. 前端开发规范

#### 必须使用的工具
- **类型定义**：从 `types/game-types.ts` 导入所有类型
- **API调用**：使用 `types/api-client.ts` 中的 `GameApiClient`
- **不要直接** 使用 fetch 或 axios，统一使用 API 客户端

#### 示例代码
```typescript
// 正确的做法
import { UserHero, HeroListParams } from '@/types/game-types';
import { apiClient } from '@/services/api';

const response = await apiClient.getHeroes({ page: 1, limit: 20 });

// 错误的做法 - 不要这样做！
const response = await fetch('/api/heroes'); // ❌ 不要直接调用
```

### 4. 状态管理规范

- 使用 Redux Toolkit 管理全局状态
- 每个功能模块创建独立的 slice
- API 调用使用 createAsyncThunk

### 5. WebSocket 规范

- WebSocket URL: `ws://localhost:1337/?token={authToken}`
- 事件格式参考 `api-specs/` 中的 `webSocketEvents`
- 使用 `types/game-types.ts` 中的 WebSocket 相关类型

## 具体任务实施指南

### 实现新功能时的步骤

1. **理解需求**
   - 查看相关的游戏规则配置文件
   - 确认需要调用哪些API

2. **后端实现**
   - 在 Strapi 中创建对应的 content-type 或 controller
   - 严格按照 API 规范实现接口
   - 使用游戏规则配置中的数值和逻辑

3. **前端实现**
   - 导入必要的类型定义
   - 使用 API 客户端调用接口
   - 实现错误处理和加载状态

4. **测试验证**
   - 确保 API 返回格式符合规范
   - 验证游戏逻辑符合配置要求

### 常见任务示例

#### 1. 实现武将升级功能

```typescript
// 后端：参考 hero-apis.json 中的 /heroes/{heroId}/level-up
// 使用 hero-system.json 中的升级规则

// 前端：
import { HeroLevelUpRequest } from '@/types/game-types';
const result = await apiClient.levelUpHero(heroId, levelUpData);
```

#### 2. 实现战斗系统

```typescript
// 后端：参考 battle-apis.json 中的战斗相关接口
// 使用 battle-system.json 中的战斗公式和规则

// 前端：
import { BattleStartRequest } from '@/types/game-types';
const battle = await apiClient.startBattle(battleData);
```

#### 3. 实现资源购买

```typescript
// 后端：参考 resource-apis.json 中的商店接口
// 使用 resource-system.json 中的价格配置

// 前端：
const result = await apiClient.purchaseShopItem({
  shopType: 'general',
  itemId: 123,
  quantity: 1
});
```

## 重要提醒

1. **不要创建新的API格式**，使用已定义的规范
2. **不要硬编码游戏数值**，从配置文件读取
3. **不要忽略类型定义**，确保类型安全
4. **不要跳过错误处理**，参考 API 规范中的错误码

## 【强制】启动命令

### 前端启动
```bash
# 启动前端开发服务器
cd web-client && npm run dev

# 【强制】前端运行在 http://localhost:3000
# 【强制】后端运行在 http://localhost:1337
```

### 完整开发流程
```bash
# 1. 启动后端（常驻运行）
cd server
npm run develop

# 2. 启动前端（开发时）
cd ../web-client
npm run dev

# 3. 访问应用
# 前端：http://localhost:3000
# 后端：http://localhost:1337
# 后台管理：http://localhost:1337/admin
```

## 调试技巧

1. 检查浏览器控制台的网络请求
2. 验证 API 响应格式是否符合规范
3. 确认使用了正确的类型定义
4. 查看 Strapi 后台日志

### Service Worker 调试

#### 常见错误和解决方案

1. **POST请求缓存错误**
   ```
   TypeError: Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported
   ```
   **解决方案**: 已修复，只缓存GET请求

2. **Service Worker 更新问题**
   - 使用开发工具强制更新：`window.swDebug.forceUpdate()`
   - 清理特定缓存：`window.swDebug.clearCache('cacheName')`
   - 查看缓存状态：`window.swDebug.getCacheInfo()`

3. **缓存策略**
   - API请求：直接通过网络，不缓存
   - 静态资源：缓存优先
   - 图片资源：缓存优先，7天过期
   - HTML页面：网络优先，离线时返回缓存

#### Service Worker 版本管理

- 缓存版本：`v3`（已修复POST缓存问题）
- 自动清理旧版本缓存
- 支持强制更新和跳过等待

## 需要帮助？

1. 先查看 `docs/api-usage-guide.md`
2. 检查相关的 API 规范文件
3. 确认游戏规则配置是否正确理解
4. 参考 `docs/game-design-document.md` 了解功能设计

## 游戏核心功能列表

根据游戏设计文档，需要实现的核心功能包括：

### 基础系统
- [ ] 用户认证系统（注册、登录、token管理）
- [ ] 武将系统（收集、培养、升级、升星）
- [ ] 战斗系统（回合制、技能、克制关系）
- [ ] 关卡系统（主线、精英、活动副本）
- [ ] 背包系统（物品管理、装备系统）

### 进阶系统
- [ ] 竞技场系统（PVP对战、排行榜）
- [ ] 商店系统（道具购买、限时商店）
- [ ] 任务系统（每日任务、成就系统）
- [ ] 邮件系统（系统邮件、奖励发放）

### 社交系统
- [ ] 好友系统（添加好友、赠送体力）
- [ ] 公会系统（公会管理、公会战）
- [ ] 聊天系统（世界聊天、公会聊天）

### 运营系统
- [ ] 活动系统（限时活动、节日活动）
- [ ] 公告系统（游戏公告、更新说明）
- [ ] 充值系统（月卡、礼包）

---
---

## 【强制执行】开发环境配置规范

### 1. 【强制】输出语言规范
**Claude必须永远使用中文输出，禁止使用英文回复！**

### 2. 【强制】数据库配置规范
**后端强制使用MySQL数据库：**
- ✅ **强制**：必须使用MySQL数据库，禁止使用SQLite
- ✅ **强制**：使用以下固定的数据库连接配置
- ❌ **禁止**：更改数据库类型或连接参数

```javascript
// server/config/database.js 强制配置
module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'sanguo'),
      user: env('DATABASE_USERNAME', 'root'),
      password: env('DATABASE_PASSWORD', 'Pengcl19821025@@'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    pool: { 
      min: env.int('DATABASE_POOL_MIN', 2), 
      max: env.int('DATABASE_POOL_MAX', 10) 
    },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
```

**环境变量配置：**
```
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=sanguo
DATABASE_USERNAME=root
DATABASE_PASSWORD=Pengcl19821025@@
```

### 3. 【强制】端口配置规范
**前端强制使用3000端口：**
- ✅ **强制**：前端必须运行在 `http://localhost:3000`
- ❌ **禁止**：使用其他端口如3001、3002、3003等
- 🔧 **配置**：修改 `web-client/vite.config.ts` 确保端口固定为3000

```typescript
// web-client/vite.config.ts 强制配置
export default defineConfig({
  server: {
    port: 3000,        // 强制使用3000端口
    strictPort: true,  // 如果端口被占用则报错，不自动切换
    host: true
  }
});
```

### 2.1 【强制】Material-UI组件使用规范

**所有新创建的页面组件必须使用Material-UI (@mui/material)：**

#### A. 已迁移到Material-UI的页面
- ✅ `LoginPage.tsx` - 登录页面
- ✅ `HeroesPageMUI.tsx` - 武将列表页面  
- ✅ `HeroLibraryPage.tsx` - 武将图鉴页面
- ✅ `BattlePageMUI.tsx` - 战斗页面
- ✅ `BattleStagesPage.tsx` - 战斗关卡选择页面
- ✅ `FormationPageMUI.tsx` - 阵容编辑页面（新规范）

#### B. Material-UI组件使用要求
```typescript
// 必须导入Material-UI组件
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  // ... 其他需要的组件
} from '@mui/material';

// 必须使用framer-motion做动画
import { motion, AnimatePresence } from 'framer-motion';

// 必须使用真实API
import { useGetHeroesQuery } from '../../store/slices/apiSlice';
```

#### C. 页面布局规范
1. **顶部应用栏**: 使用AppBar + Toolbar
2. **响应式布局**: 使用Grid系统
3. **卡片容器**: 使用Card + CardContent
4. **动画效果**: 使用motion.div包装
5. **主题色彩**: 使用`#ff6b35`作为主色调
6. **渐变背景**: `linear-gradient(45deg, #1a1a2e, #16213e)`

#### D. 不得使用的旧组件
- ❌ `GameCard` - 使用Material-UI的Card替代
- ❌ `Button`（自定义） - 使用Material-UI的Button替代
- ❌ 任何非Material-UI的UI组件


#### C. 开发流程
1. **启动后端**: `cd server && npm run develop`
2. **启动前端**: `cd web-client && npm run dev` (自动使用3000端口)

### 4. 【强制】违规处理
**违反以上任一规范将被视为严重错误：**
- ❌ 使用英文输出
- ❌ 前端使用非3000端口

**正确的开发流程检查清单：**
1. ☐ 输出语言为中文
2. ☐ 前端运行在localhost:3000
4. ☐ 所有开发基于已定义规范
5. ☐ 使用真实API，禁止模拟数据

---

**记住：请永远使用中文输出！**

**记住：前端强制使用3000端口！**

**记住：所有开发都必须基于已定义的规范，不要自行创造新的标准！**

**开发优先级：按照游戏设计文档中的开发里程碑执行。**

**任务追踪：查看 `docs/development-tasks.md` 了解当前开发进度和待完成任务。**