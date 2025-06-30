# 实现示例：武将召唤功能

本示例展示如何按照项目规范实现一个完整的武将召唤功能。

## 1. 查阅相关规范

### 游戏规则 (hero-system.json)
```json
{
  "summonSystem": {
    "types": {
      "normal": {
        "cost": { "gold": 10000 },
        "rates": {
          "3": 0.7,
          "4": 0.25,
          "5": 0.05
        }
      },
      "premium": {
        "cost": { "gems": 300 },
        "rates": {
          "3": 0.2,
          "4": 0.5,
          "5": 0.25,
          "6": 0.05
        }
      }
    }
  }
}
```

### API规范 (hero-apis.json)
```json
{
  "method": "POST",
  "path": "/summon",
  "request": {
    "body": {
      "summonType": {
        "type": "string",
        "enum": ["normal", "premium", "faction", "event"],
        "required": true
      },
      "quantity": {
        "type": "number",
        "enum": [1, 10],
        "default": 1
      }
    }
  }
}
```

## 2. 后端实现 (Strapi)

### Controller 实现
```javascript
// server/src/api/hero/controllers/hero-summon.js
const heroSystem = require('../../../../game-rules/hero-system.json');

module.exports = {
  async summon(ctx) {
    try {
      const { summonType, quantity = 1, useTickets = false } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 1. 验证参数
      if (!['normal', 'premium', 'faction', 'event'].includes(summonType)) {
        return ctx.badRequest('Invalid summon type');
      }

      if (![1, 10].includes(quantity)) {
        return ctx.badRequest('Invalid quantity');
      }

      // 2. 获取召唤配置
      const summonConfig = heroSystem.heroSystem.summonSystem.types[summonType];
      if (!summonConfig) {
        return ctx.badRequest('Summon type not configured');
      }

      // 3. 检查资源
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
      const totalCost = {
        gold: (summonConfig.cost.gold || 0) * quantity,
        gems: (summonConfig.cost.gems || 0) * quantity
      };

      if (totalCost.gold > 0 && user.gold < totalCost.gold) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_GOLD',
            message: '金币不足'
          }
        };
      }

      if (totalCost.gems > 0 && user.gems < totalCost.gems) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_GEMS',
            message: '元宝不足'
          }
        };
      }

      // 4. 执行召唤
      const results = [];
      for (let i = 0; i < quantity; i++) {
        const hero = await this.performSingleSummon(summonConfig.rates);
        results.push(hero);
      }

      // 5. 扣除资源
      await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: {
          gold: user.gold - totalCost.gold,
          gems: user.gems - totalCost.gems
        }
      });

      // 6. 返回标准格式
      return {
        success: true,
        data: {
          results,
          costsUsed: {
            gold: totalCost.gold,
            gems: totalCost.gems,
            tickets: 0
          },
          pityCounter: await this.getPityCounter(userId, summonType),
          guaranteeProgress: {}
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUMMON_ERROR',
          message: error.message
        }
      };
    }
  },

  async performSingleSummon(rates) {
    // 根据概率随机选择稀有度
    const random = Math.random();
    let rarity = 3;
    let cumulative = 0;

    for (const [r, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (random <= cumulative) {
        rarity = parseInt(r);
        break;
      }
    }

    // 从对应稀有度的英雄池中随机选择
    const heroPool = await strapi.entityService.findMany('api::hero-template.hero-template', {
      filters: { rarity, isActive: true }
    });

    const selectedHero = heroPool[Math.floor(Math.random() * heroPool.length)];

    // 检查是否已拥有
    const existingHero = await strapi.entityService.findMany('api::user-hero.user-hero', {
      filters: { 
        user: ctx.state.user.id,
        heroId: selectedHero.id
      }
    });

    if (existingHero.length > 0) {
      // 已拥有，转换为碎片
      return {
        isNew: false,
        hero: null,
        fragments: {
          heroId: selectedHero.id,
          quantity: rarity * 10 // 根据稀有度给予碎片
        },
        rarity
      };
    } else {
      // 新英雄，创建记录
      const newHero = await strapi.entityService.create('api::user-hero.user-hero', {
        data: {
          user: ctx.state.user.id,
          heroId: selectedHero.id,
          name: selectedHero.name,
          level: 1,
          rarity: rarity,
          // ... 其他字段
        }
      });

      return {
        isNew: true,
        hero: newHero,
        fragments: null,
        rarity
      };
    }
  }
};
```

### 路由配置
```javascript
// server/src/api/hero/routes/hero-summon.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/heroes/summon',
      handler: 'hero-summon.summon',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
```

## 3. 前端实现

### 组件实现
```typescript
// web-client/src/pages/summon/SummonPage.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  HeroSummonRequest, 
  HeroSummonResult,
  Resources 
} from '@/types/game-types';
import { apiClient } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateResources } from '@/store/slices/resourceSlice';

const SummonPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(state => state.resources);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HeroSummonResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSummon = async (summonType: 'normal' | 'premium', quantity: 1 | 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const request: HeroSummonRequest = {
        summonType,
        quantity,
        useTickets: false
      };

      const response = await apiClient.summonHeroes(request);
      
      if (response.success && response.data) {
        setResults(response.data.results);
        
        // 更新资源显示
        if (response.data.costsUsed.gold > 0) {
          dispatch(updateResources({
            gold: resources.gold - response.data.costsUsed.gold
          }));
        }
        if (response.data.costsUsed.gems > 0) {
          dispatch(updateResources({
            gems: resources.gems - response.data.costsUsed.gems
          }));
        }
      } else {
        setError(response.error?.message || '召唤失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        武将召唤
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 普通召唤 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                普通召唤
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                消耗金币进行召唤，有机会获得3-5星武将
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleSummon('normal', 1)}
                  disabled={loading || resources.gold < 10000}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  单次召唤 (10,000 金币)
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSummon('normal', 10)}
                  disabled={loading || resources.gold < 100000}
                  fullWidth
                >
                  十连召唤 (100,000 金币)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 高级召唤 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                高级召唤
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                消耗元宝进行召唤，更高概率获得高星武将
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSummon('premium', 1)}
                  disabled={loading || resources.gems < 300}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  单次召唤 (300 元宝)
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSummon('premium', 10)}
                  disabled={loading || resources.gems < 3000}
                  fullWidth
                >
                  十连召唤 (3,000 元宝)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 召唤结果 */}
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            召唤结果
          </Typography>
          <Grid container spacing={2}>
            {results.map((result, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card 
                  sx={{ 
                    bgcolor: result.isNew ? 'success.light' : 'grey.200',
                    border: `2px solid ${getRarityColor(result.rarity)}`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {result.isNew ? '新武将！' : '转换碎片'}
                    </Typography>
                    {result.hero && (
                      <Typography align="center">
                        {result.hero.name}
                      </Typography>
                    )}
                    {result.fragments && (
                      <Typography align="center" variant="body2">
                        {result.fragments.quantity} 碎片
                      </Typography>
                    )}
                    <Typography 
                      align="center" 
                      variant="caption"
                      sx={{ color: getRarityColor(result.rarity) }}
                    >
                      {result.rarity}星
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

function getRarityColor(rarity: number): string {
  const colors = {
    1: '#808080', // 灰色
    2: '#4CAF50', // 绿色
    3: '#2196F3', // 蓝色
    4: '#9C27B0', // 紫色
    5: '#FF9800', // 橙色
    6: '#F44336', // 红色
  };
  return colors[rarity] || '#808080';
}

export default SummonPage;
```

### Redux Slice
```typescript
// web-client/src/store/slices/summonSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/services/api';
import { HeroSummonRequest, HeroSummonResult } from '@/types/game-types';

export const performSummon = createAsyncThunk(
  'summon/perform',
  async (request: HeroSummonRequest) => {
    const response = await apiClient.summonHeroes(request);
    if (!response.success) {
      throw new Error(response.error?.message || 'Summon failed');
    }
    return response.data!;
  }
);

const summonSlice = createSlice({
  name: 'summon',
  initialState: {
    results: [] as HeroSummonResult[],
    loading: false,
    error: null as string | null,
    history: [] as any[],
    pityCounter: 0
  },
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSummon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSummon.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.pityCounter = action.payload.pityCounter;
        state.history.push({
          timestamp: new Date().toISOString(),
          results: action.payload.results
        });
      })
      .addCase(performSummon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unknown error';
      });
  }
});

export const { clearResults } = summonSlice.actions;
export default summonSlice.reducer;
```

## 4. 测试验证

### API 测试
```bash
# 测试单次召唤
curl -X POST http://localhost:1337/api/heroes/summon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summonType": "normal",
    "quantity": 1
  }'

# 验证响应格式
{
  "success": true,
  "data": {
    "results": [{
      "isNew": true,
      "hero": {...},
      "fragments": null,
      "rarity": 4
    }],
    "costsUsed": {
      "gold": 10000,
      "gems": 0,
      "tickets": 0
    },
    "pityCounter": 1,
    "guaranteeProgress": {}
  }
}
```

### 前端测试
1. 检查资源是否正确扣除
2. 验证召唤结果显示
3. 测试错误处理（资源不足等）
4. 确认动画和用户体验

## 总结

这个示例展示了：
1. ✅ 如何查阅游戏规则和API规范
2. ✅ 如何实现符合规范的后端API
3. ✅ 如何使用类型定义和API客户端
4. ✅ 如何处理错误和状态管理
5. ✅ 如何进行测试验证

记住：始终以规范文件为准，不要自行创造新的标准！