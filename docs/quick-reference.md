# 三国卡牌游戏 - 快速参考

## 🚀 快速开始

```bash
# 后端
cd server && npm run develop  # http://localhost:1337

# 前端  
cd web-client && npm run dev  # http://localhost:3001
```

## 📁 必看文件清单

| 文件类型 | 位置 | 用途 |
|---------|------|------|
| **游戏规则** | `game-rules/*.json` | 所有游戏数值和逻辑配置 |
| **API规范** | `api-specs/*.json` | 接口定义和数据模型 |
| **类型定义** | `types/game-types.ts` | TypeScript类型 |
| **API客户端** | `types/api-client.ts` | 前端API调用 |
| **开发指南** | `docs/api-usage-guide.md` | 详细开发流程 |

## 🎮 核心功能对照表

| 功能模块 | 游戏规则文件 | API规范文件 | 主要接口 |
|---------|-------------|------------|---------|
| **认证** | - | auth-apis.json | `/api/auth/*` |
| **武将** | hero-system.json | hero-apis.json | `/api/heroes/*` |
| **战斗** | battle-system.json | battle-apis.json | `/api/battles/*` |
| **资源** | resource-system.json | resource-apis.json | `/api/resources/*` |
| **社交** | - | social-apis.json | `/api/social/*` |
| **进度** | progression-system.json | - | - |

## 💻 代码模板

### 后端 API 实现模板

```javascript
// Strapi Controller 示例
module.exports = {
  async find(ctx) {
    try {
      // 1. 验证参数（参考 api-specs）
      const { page = 1, limit = 20 } = ctx.query;
      
      // 2. 执行业务逻辑（参考 game-rules）
      const data = await strapi.service('api::hero.hero').find({
        pagination: { page, limit }
      });
      
      // 3. 返回标准格式（必须）
      return {
        success: true,
        data: {
          heroes: data.results,
          pagination: data.pagination
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      };
    }
  }
};
```

### 前端 API 调用模板

```typescript
// React 组件示例
import { useEffect, useState } from 'react';
import { UserHero } from '@/types/game-types';
import { apiClient } from '@/services/api';

function HeroList() {
  const [heroes, setHeroes] = useState<UserHero[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getHeroes({ 
          page: 1, 
          limit: 20,
          sort: 'power',
          order: 'desc' 
        });
        
        if (response.success) {
          setHeroes(response.data!.heroes);
        }
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHeroes();
  }, []);
  
  return (
    // UI 渲染
  );
}
```

### Redux Slice 模板

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/services/api';

export const fetchHeroes = createAsyncThunk(
  'heroes/fetch',
  async (params: any) => {
    const response = await apiClient.getHeroes(params);
    if (!response.success) throw new Error(response.error?.message);
    return response.data!;
  }
);

const heroesSlice = createSlice({
  name: 'heroes',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHeroes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.heroes;
      })
      .addCase(fetchHeroes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});
```

## 🛠 常用数据结构

### API 响应格式
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    pagination?: {...}
  };
}
```

### 分页参数
```typescript
{
  page: number;    // 默认 1
  limit: number;   // 默认 20，最大 100
}
```

### WebSocket 消息格式
```typescript
{
  type: string;      // 事件类型
  payload: any;      // 事件数据
  timestamp: string; // 时间戳
}
```

## 🔍 调试检查清单

- [ ] API 返回格式是否符合规范？
- [ ] 是否使用了正确的类型定义？
- [ ] 游戏数值是否从配置文件读取？
- [ ] 错误处理是否完整？
- [ ] 是否使用了 API 客户端？
- [ ] WebSocket 事件格式是否正确？

## 📝 常用命令

```bash
# 类型检查
cd web-client && npm run type-check

# 代码格式化
npm run format

# 构建生产版本
npm run build

# 运行测试
npm run test
```

## ⚠️ 注意事项

1. **不要硬编码**游戏数值
2. **不要绕过** API 客户端直接调用
3. **不要忽略**类型定义
4. **不要创建**新的 API 格式
5. **必须遵循**已定义的规范

##  🎯 记住的标准

1. **CollectionName简洁，无前缀**
2. **统一使用Strapi标准id主键**
3. **优先使用关联关系而非string类型**
4. **保持数据结构的完整性和一致性**

## 🔗 快速链接

- [完整开发指南](./api-usage-guide.md)
- [API 规范目录](../api-specs/)
- [游戏规则配置](../game-rules/)
- [类型定义文件](../types/game-types.ts)