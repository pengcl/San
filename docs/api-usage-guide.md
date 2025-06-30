# 三国卡牌游戏 API 使用指南

## 概述

本指南提供了三国卡牌游戏前后端API的统一使用标准，确保开发过程中的一致性和协调性。

## 目录结构

```
├── api-specs/           # API规范文件
│   ├── auth-apis.json      # 认证相关API
│   ├── hero-apis.json      # 武将相关API  
│   ├── battle-apis.json    # 战斗相关API
│   ├── resource-apis.json  # 资源相关API
│   └── social-apis.json    # 社交相关API
├── game-rules/          # 游戏规则配置
│   ├── core-mechanics.json     # 核心机制
│   ├── battle-system.json      # 战斗系统
│   ├── hero-system.json        # 武将系统
│   ├── resource-system.json    # 资源系统
│   └── progression-system.json # 进度系统
├── types/               # 类型定义
│   ├── game-types.ts        # 统一数据类型
│   └── api-client.ts        # API客户端
└── docs/                # 文档
    └── api-usage-guide.md   # 本指南
```

## 后端开发指南

### 1. 使用游戏规则配置

后端应该读取 `game-rules/` 目录下的配置文件来实现游戏逻辑：

```javascript
// 示例：读取武将系统配置
const heroSystemConfig = require('../game-rules/hero-system.json');

// 实现武将升级逻辑
function calculateHeroLevelUp(currentLevel, experience) {
  const levelTable = heroSystemConfig.heroSystem.levelProgression.experienceTable;
  // 根据配置计算升级
}

// 实现召唤系统
function performHeroSummon(summonType) {
  const rates = heroSystemConfig.heroSystem.summonSystem.rates[summonType];
  // 根据配置的概率进行召唤
}
```

### 2. 实现API规范

严格按照 `api-specs/` 中定义的接口规范实现API：

```javascript
// 示例：实现武将列表API (基于 hero-apis.json)
app.get('/api/heroes', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'power', order = 'desc', faction, rarity, unitType } = req.query;
    
    // 验证参数（按照API规范的参数定义）
    if (limit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LIMIT',
          message: '每页最多返回100条记录'
        }
      });
    }

    // 查询用户武将
    const heroes = await getUserHeroes(req.user.id, { page, limit, sort, order, faction, rarity, unitType });
    
    // 返回标准格式响应
    res.json({
      success: true,
      data: {
        heroes: heroes.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: heroes.total,
          totalPages: Math.ceil(heroes.total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});
```

### 3. 数据模型实现

使用API规范中定义的数据模型创建数据库表：

```javascript
// 示例：Strapi User模型 (基于 auth-apis.json 的数据模型)
module.exports = {
  attributes: {
    username: {
      type: 'string',
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 20
    },
    email: {
      type: 'email',
      unique: true,
      required: true
    },
    level: {
      type: 'integer',
      defaultValue: 1
    },
    experience: {
      type: 'integer',
      defaultValue: 0
    },
    gold: {
      type: 'integer',
      defaultValue: 10000
    },
    gems: {
      type: 'integer',
      defaultValue: 100
    },
    // ... 其他字段按照API规范定义
  }
};
```

### 4. WebSocket事件处理

实现API规范中定义的WebSocket事件：

```javascript
// 示例：战斗相关WebSocket事件
io.on('connection', (socket) => {
  socket.on('battle.join', (battleId) => {
    socket.join(`battle-${battleId}`);
  });

  // 战斗动作更新（按照battle-apis.json规范）
  socket.on('battle.action', (data) => {
    // 处理战斗动作
    const result = processBattleAction(data);
    
    // 广播给房间内所有玩家
    io.to(`battle-${data.battleId}`).emit('battle.action', {
      battleId: data.battleId,
      action: data.action,
      result: result,
      nextTurn: getNextTurn(data.battleId)
    });
  });
});
```

## 前端开发指南

### 1. 使用类型定义

导入统一的类型定义确保类型安全：

```typescript
import { 
  User, 
  UserHero, 
  Battle, 
  ApiResponse,
  HeroListParams 
} from '../types/game-types';

// 使用类型定义
interface HeroListState {
  heroes: UserHero[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### 2. 使用API客户端

使用统一的API客户端进行接口调用：

```typescript
import { createApiClient } from '../types/api-client';

// 创建API客户端实例
const apiClient = createApiClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:1337',
  timeout: 10000
});

// 在组件中使用
const HeroList: React.FC = () => {
  const [heroes, setHeroes] = useState<UserHero[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHeroes = async (params?: HeroListParams) => {
    setLoading(true);
    try {
      const response = await apiClient.getHeroes(params);
      if (response.success) {
        setHeroes(response.data!.heroes);
      }
    } catch (error) {
      console.error('Failed to load heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeroes();
  }, []);

  return (
    <div>
      {loading ? (
        <div>加载中...</div>
      ) : (
        heroes.map(hero => (
          <HeroCard key={hero.id} hero={hero} />
        ))
      )}
    </div>
  );
};
```

### 3. WebSocket集成

实现WebSocket连接处理实时事件：

```typescript
import { WebSocketMessage, BattleUpdatePayload } from '../types/game-types';

class GameWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    this.ws = new WebSocket(`ws://localhost:1337/?token=${token}`);
    
    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => listener(message.payload));
  }

  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // 发送战斗动作
  sendBattleAction(battleId: string, action: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'battle.action',
        payload: { battleId, action }
      }));
    }
  }
}

// 在React组件中使用
const BattlePage: React.FC = () => {
  const [ws] = useState(() => new GameWebSocket());

  useEffect(() => {
    // 连接WebSocket
    const token = localStorage.getItem('authToken');
    if (token) {
      ws.connect(token);
    }

    // 监听战斗更新事件
    ws.subscribe('battle.action', (payload: BattleUpdatePayload) => {
      // 更新战斗状态
      updateBattleState(payload);
    });

    ws.subscribe('battle.ended', (payload: any) => {
      // 处理战斗结束
      handleBattleEnd(payload);
    });

    return () => {
      ws.disconnect();
    };
  }, []);
};
```

### 4. 状态管理

使用Redux Toolkit管理游戏状态：

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../services/api';
import { UserHero, HeroListParams } from '../types/game-types';

// 异步thunk
export const fetchHeroes = createAsyncThunk(
  'heroes/fetchHeroes',
  async (params?: HeroListParams) => {
    const response = await apiClient.getHeroes(params);
    if (!response.success) {
      throw new Error(response.error?.message);
    }
    return response.data!;
  }
);

// Slice定义
const heroesSlice = createSlice({
  name: 'heroes',
  initialState: {
    list: [] as UserHero[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.heroes;
      })
      .addCase(fetchHeroes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch heroes';
      });
  },
});

export const { clearError } = heroesSlice.actions;
export default heroesSlice.reducer;
```

## 错误处理标准

### 1. 后端错误响应格式

所有API都应返回统一的错误格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "用户友好的错误消息",
    "details": {
      "field": "具体的错误详情"
    }
  }
}
```

### 2. 前端错误处理

```typescript
try {
  const response = await apiClient.someMethod();
  if (!response.success) {
    // 处理业务错误
    handleBusinessError(response.error);
  }
} catch (error) {
  if (error instanceof ApiError) {
    // 处理API错误
    switch (error.code) {
      case 'UNAUTHORIZED':
        // 重定向到登录页
        redirectToLogin();
        break;
      case 'VALIDATION_ERROR':
        // 显示表单验证错误
        showValidationErrors(error.details);
        break;
      default:
        // 显示通用错误消息
        showErrorMessage(error.message);
    }
  } else {
    // 处理网络错误等
    showErrorMessage('网络连接失败，请稍后重试');
  }
}
```

## 开发工作流

### 1. 新功能开发流程

1. **设计阶段**：更新相关的游戏规则配置文件
2. **API设计**：在对应的API规范文件中定义接口
3. **类型定义**：在 `game-types.ts` 中添加必要的类型定义
4. **后端实现**：按照API规范实现接口
5. **前端实现**：使用API客户端调用接口
6. **测试**：确保前后端接口对接正确

### 2. 版本控制

- 所有配置文件和类型定义都应纳入版本控制
- API版本变更时同步更新API规范和类型定义
- 使用语义化版本控制管理API版本

### 3. 文档维护

- 配置变更时及时更新相关文档
- API变更时更新API规范文件
- 定期review和优化类型定义

## 最佳实践

### 1. 性能优化

- 使用分页加载减少数据传输
- 实现请求缓存机制
- 合理使用WebSocket避免频繁HTTP请求

### 2. 安全考虑

- 所有敏感操作都需要身份验证
- 实现请求频率限制
- 验证所有用户输入

### 3. 可维护性

- 保持API接口的向后兼容性
- 使用TypeScript确保类型安全
- 编写完整的单元测试

## 故障排查

### 1. 常见问题

**Q: API调用返回401错误**
A: 检查token是否过期，调用refreshToken刷新认证状态

**Q: WebSocket连接失败**
A: 确认服务器WebSocket服务正常，检查token参数是否正确

**Q: 类型错误**
A: 确保使用最新的类型定义文件，检查API返回数据格式是否匹配

### 2. 调试工具

- 使用浏览器开发者工具监控网络请求
- 后端使用日志记录API调用详情
- 实现健康检查接口监控服务状态

---

通过遵循本指南，前后端开发人员可以高效协作，确保游戏功能的一致性和稳定性。