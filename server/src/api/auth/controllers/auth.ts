/**
 * 用户认证控制器
 * 基于API规范 auth-apis.json 实现
 */

import { Context } from 'koa';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export default {
  /**
   * 用户注册
   */
  async register(ctx: Context) {
    try {
      const { username, email, password, confirmPassword, inviteCode } = ctx.request.body;

      // 参数验证
      if (!username || !email || !password || !confirmPassword) {
        return ctx.badRequest('缺少必要参数');
      }

      if (password !== confirmPassword) {
        return ctx.badRequest('密码不匹配');
      }

      if (username.length < 3 || username.length > 20) {
        return ctx.badRequest('用户名长度必须在3-20字符之间');
      }

      if (password.length < 6 || password.length > 50) {
        return ctx.badRequest('密码长度必须在6-50字符之间');
      }

      // 检查用户名和邮箱是否已存在
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return ctx.badRequest('用户名或邮箱已存在');
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 12);

      // 创建用户
      const newUser = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username,
          email,
          password: hashedPassword,
          confirmed: true,
          blocked: false,
          provider: 'local',
          role: await strapi.db.query('plugin::users-permissions.role').findOne({
            where: { type: 'authenticated' }
          }).then(role => role.id)
        }
      });

      // 创建用户档案
      const userProfile = await strapi.db.query('api::user-profile.user-profile').create({
        data: {
          user: newUser.id,
          nickname: username,
          level: 1,
          exp: 0,
          vip_level: 0,
          gold: 10000,
          diamond: 100,
          stamina: 120,
          total_login_days: 1,
          power: 0,
          last_login_time: new Date()
        }
      });

      // 给新用户分配初始武将（刘备 - 适合新手的蜀国武将）
      await giveInitialHeroesToNewUser(newUser.id);

      // 生成JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          username: newUser.username,
          email: newUser.email 
        },
        process.env.JWT_SECRET || 'default-secret',
        { 
          expiresIn: '1h',
          issuer: 'sanguo-game',
          audience: 'game-client'
        }
      );

      const refreshToken = jwt.sign(
        { id: newUser.id, type: 'refresh' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        level: userProfile.level,
        experience: userProfile.exp,
        gold: userProfile.gold,
        gems: userProfile.diamond,
        energy: userProfile.stamina,
        maxEnergy: 120,
        vipLevel: userProfile.vip_level,
        avatar: userProfile.avatar_url,
        createdAt: newUser.createdAt,
        lastLogin: userProfile.last_login_time
      };

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: {
          user: userResponse,
          token,
          refreshToken,
          expiresIn: 3600
        }
      };
    } catch (error) {
      console.error('注册错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'REGISTER_ERROR',
          message: '注册失败'
        }
      };
    }
  },

  /**
   * 用户登录
   */
  async login(ctx: Context) {
    try {
      const { identifier, password, rememberMe = false } = ctx.request.body;

      if (!identifier || !password) {
        return ctx.badRequest('缺少用户名/邮箱或密码');
      }

      // 查找用户
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { username: identifier },
            { email: identifier }
          ]
        }
      });

      if (!user) {
        return ctx.badRequest('用户名或密码错误');
      }

      if (user.blocked) {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'ACCOUNT_BLOCKED',
            message: '账户已被禁用'
          }
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return ctx.badRequest('用户名或密码错误');
      }

      // 更新最后登录时间
      const now = new Date();
      const existingProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      if (existingProfile) {
        await strapi.db.query('api::user-profile.user-profile').update({
          where: { id: existingProfile.id },
          data: {
            last_login_time: now,
            total_login_days: existingProfile.total_login_days + 1
          }
        });
      }

      // 生成JWT token
      const tokenExpiry = rememberMe ? '30d' : '1h';
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          email: user.email 
        },
        process.env.JWT_SECRET || 'default-secret',
        { 
          expiresIn: tokenExpiry,
          issuer: 'sanguo-game',
          audience: 'game-client'
        }
      );

      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      const updatedProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        level: updatedProfile.level,
        experience: updatedProfile.exp,
        gold: updatedProfile.gold,
        gems: updatedProfile.diamond,
        energy: updatedProfile.stamina,
        maxEnergy: 120,
        vipLevel: updatedProfile.vip_level,
        avatar: updatedProfile.avatar_url,
        lastLogin: updatedProfile.last_login_time,
        dailyLoginStreak: 1, // TODO: 实现连续登录逻辑
        totalLoginDays: updatedProfile.total_login_days
      };

      ctx.body = {
        success: true,
        data: {
          user: userResponse,
          token,
          refreshToken,
          expiresIn: rememberMe ? 2592000 : 3600
        }
      };
    } catch (error) {
      console.error('登录错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: '登录失败'
        }
      };
    }
  },

  /**
   * 刷新令牌
   */
  async refresh(ctx: Context) {
    try {
      const { refreshToken } = ctx.request.body;

      if (!refreshToken) {
        return ctx.badRequest('缺少刷新令牌');
      }

      // 验证刷新令牌
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default-secret') as any;
      
      if (decoded.type !== 'refresh') {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: '刷新令牌无效'
          }
        };
      }

      // 查找用户
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: decoded.id }
      });

      if (!user || user.blocked) {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: '用户无效或已被禁用'
          }
        };
      }

      // 生成新的token
      const newToken = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          email: user.email 
        },
        process.env.JWT_SECRET || 'default-secret',
        { 
          expiresIn: '1h',
          issuer: 'sanguo-game',
          audience: 'game-client'
        }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      ctx.body = {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: 3600
        }
      };
    } catch (error) {
      console.error('刷新令牌错误:', error);
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: {
          code: 'REFRESH_TOKEN_ERROR',
          message: '刷新令牌无效或已过期'
        }
      };
    }
  },

  /**
   * 获取当前用户信息
   */
  async me(ctx: Context) {
    try {
      // 检查认证头部
      const authHeader = ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '缺少认证令牌'
          }
        };
      }

      const token = authHeader.substring(7);
      
      // 验证JWT令牌
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      } catch (jwtError) {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '令牌无效或已过期'
          }
        };
      }

      // 查找用户
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: decoded.id }
      });
      
      if (!user) {
        ctx.status = 401;
        return ctx.body = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用户不存在'
          }
        };
      }

      const userProfile = await strapi.db.query('api::user-profile.user-profile').findOne({
        where: { user: user.id }
      });

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        level: userProfile?.level || 1,
        experience: userProfile?.exp || 0,
        gold: userProfile?.gold || 0,
        gems: userProfile?.diamond || 0,
        energy: userProfile?.stamina || 120,
        maxEnergy: 120,
        energyLastUpdate: userProfile?.stamina_update_time,
        vipLevel: userProfile?.vip_level || 0,
        vipExperience: 0,
        avatar: userProfile?.avatar_url,
        createdAt: user.createdAt,
        lastLogin: userProfile?.last_login_time,
        dailyLoginStreak: 1,
        totalLoginDays: userProfile?.total_login_days || 0,
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          notificationsEnabled: true,
          language: 'zh-CN'
        },
        statistics: {
          totalBattles: 0,
          totalVictories: 0,
          winRate: 0,
          highestArenaRank: 0,
          totalHeroes: 0,
          totalPlayTime: 0
        }
      };

      ctx.body = {
        success: true,
        data: userResponse
      };
    } catch (error) {
      console.error('获取用户信息错误:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: '获取用户信息失败'
        }
      };
    }
  },

  /**
   * 用户登出
   */
  async logout(ctx: Context) {
    // 简单实现，客户端清除token
    ctx.body = {
      success: true,
      data: {
        message: '登出成功'
      }
    };
  }
};

/**
 * 给新用户分配初始武将
 */
async function giveInitialHeroesToNewUser(userId: number) {
  try {
    // 获取刘备武将模板（hero_id = 1001）
    const liubeiHero = await strapi.db.query('api::hero.hero').findOne({
      where: { hero_id: 1001 }
    });

    if (liubeiHero) {
      // 创建用户武将 - 刘备 (2星，等级10)
      await strapi.db.query('api::user-hero.user-hero').create({
        data: {
          user: userId,
          hero: liubeiHero.id,
          level: 10,
          star: 2,
          exp: 0,
          breakthrough: 0,
          power: calculateInitialPower(liubeiHero, 10, 2),
          is_favorite: true
        }
      });

      console.log(`✅ 新用户 ${userId} 获得初始武将：刘备`);
    }

    // 获取其他初始武将（关羽、张飞）
    const initialHeroes = await strapi.db.query('api::hero.hero').findMany({
      where: { 
        hero_id: { $in: [1003, 1004] } // 关羽、张飞
      }
    });

    for (const hero of initialHeroes) {
      await strapi.db.query('api::user-hero.user-hero').create({
        data: {
          user: userId,
          hero: hero.id,
          level: 5,
          star: 1,
          exp: 0,
          breakthrough: 0,
          power: calculateInitialPower(hero, 5, 1)
        }
      });
    }

    console.log(`✅ 新用户 ${userId} 获得桃园三结义组合！`);
  } catch (error) {
    console.error('分配初始武将失败:', error);
  }
}

/**
 * 计算初始武将战力
 */
function calculateInitialPower(hero: any, level: number, star: number): number {
  const baseHp = hero.base_hp || 1000;
  const baseAttack = hero.base_attack || 100;
  const baseDefense = hero.base_defense || 80;
  const baseSpeed = hero.base_speed || 70;

  const levelBonus = level - 1;
  const starMultiplier = 1 + (star - 1) * 0.2;
  
  const finalHp = Math.floor((baseHp + levelBonus * 50) * starMultiplier);
  const finalAttack = Math.floor((baseAttack + levelBonus * 10) * starMultiplier);
  const finalDefense = Math.floor((baseDefense + levelBonus * 8) * starMultiplier);
  const finalSpeed = Math.floor((baseSpeed + levelBonus * 2) * starMultiplier);

  // 战力计算公式
  return Math.floor(finalHp * 0.3 + finalAttack * 1.0 + finalDefense * 0.8 + finalSpeed * 0.5);
}