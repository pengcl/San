/**
 * 速率限制中间件
 */

import { Context, Next } from 'koa';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期的记录
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

function getRateLimitConfig(path: string) {
  // 开发环境下使用宽松的限制
  const isDev = process.env.NODE_ENV === 'development';
  
  if (path.includes('/auth/login')) {
    return isDev 
      ? { limit: 100, window: 5 * 60 * 1000 }  // 开发环境: 5分钟内100次
      : { limit: 5, window: 15 * 60 * 1000 };   // 生产环境: 15分钟内5次
  }
  if (path.includes('/auth/register')) {
    return isDev
      ? { limit: 50, window: 60 * 60 * 1000 }   // 开发环境: 1小时内50次
      : { limit: 3, window: 60 * 60 * 1000 };   // 生产环境: 1小时内3次
  }
  if (path.includes('/auth/refresh')) {
    return { limit: 100, window: 5 * 60 * 1000 }; // 5分钟内100次（开发生产环境一致）
  }
  
  return { limit: 1000, window: 60 * 1000 }; // 默认: 1分钟内1000次
}

export default () => {
  return async (ctx: Context, next: Next) => {
    const clientIp = ctx.ip;
    const path = ctx.path;
    const key = `${clientIp}:${path}`;
    
    const config = getRateLimitConfig(path);
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // 创建新记录或重置过期记录
      entry = {
        count: 1,
        resetTime: now + config.window
      };
      rateLimitStore.set(key, entry);
    } else {
      // 增加计数
      entry.count++;
      
      if (entry.count > config.limit) {
        ctx.status = 429;
        ctx.body = {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '请求过于频繁，请稍后再试'
          }
        };
        return;
      }
    }
    
    // 设置响应头
    ctx.set({
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.limit - entry.count).toString(),
      'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
    });
    
    return next();
  };
};