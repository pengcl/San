/**
 * JWT认证中间件
 * 用于验证游戏客户端JWT令牌并设置用户上下文
 */

import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

export default () => {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
      
      // 验证令牌签发者和受众
      if (decoded.iss !== 'sanguo-game' || decoded.aud !== 'game-client') {
        throw new Error('Invalid token issuer or audience');
      }
      
      // 查找用户
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: decoded.id },
        populate: ['role']
      });

      if (user && !user.blocked) {
        // 设置用户上下文，确保兼容Strapi的权限系统
        ctx.state.user = user;
        ctx.state.auth = {
          strategy: 'jwt-custom',
          credentials: user
        };
        
        console.log(`✅ JWT认证成功: 用户${user.username} (ID: ${user.id})`);
      }
    } catch (error) {
      console.log('JWT验证失败:', error.message);
      // 继续执行，让路由决定是否需要认证
    }

    return next();
  };
};