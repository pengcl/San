export default {
  /**
   * 处理用户连接事件
   */
  async handleUserConnect(userId: string) {
    // 可以在这里记录用户上线状态
    console.log(`👤 用户上线: ${userId}`);
    
    // 可以更新用户状态到数据库
    // await strapi.entityService.update('plugin::users-permissions.user', userId, {
    //   data: { isOnline: true, lastSeen: new Date() }
    // });
  },

  /**
   * 处理用户断开连接事件
   */
  async handleUserDisconnect(userId: string) {
    // 可以在这里记录用户下线状态
    console.log(`👤 用户下线: ${userId}`);
    
    // 可以更新用户状态到数据库
    // await strapi.entityService.update('plugin::users-permissions.user', userId, {
    //   data: { isOnline: false, lastSeen: new Date() }
    // });
  },

  /**
   * 处理游戏事件
   */
  async handleGameEvent(userId: string, eventType: string, eventData: any) {
    console.log(`🎮 游戏事件 [${userId}]: ${eventType}`, eventData);
    
    // 根据事件类型处理不同的游戏逻辑
    switch (eventType) {
      case 'battle_start':
        return this.handleBattleStart(userId, eventData);
      case 'battle_end':
        return this.handleBattleEnd(userId, eventData);
      case 'hero_upgrade':
        return this.handleHeroUpgrade(userId, eventData);
      default:
        console.log(`⚠️ 未知游戏事件类型: ${eventType}`);
    }
  },

  /**
   * 处理战斗开始事件
   */
  async handleBattleStart(userId: string, battleData: any) {
    // 创建战斗记录
    const battle = await strapi.entityService.create('api::battle.battle', {
      data: {
        player: userId,
        battle_type: battleData.battleType || 'pve_normal',
        stage_id: battleData.stageId,
        player_formation: battleData.formation,
        enemy_formation: battleData.enemies,
        result: 'ongoing' as any, // 临时设置，实际应该在战斗中更新
        ...battleData,
      },
    });

    console.log(`⚔️ 战斗开始: 用户${userId}`, battleData);
    return { success: true, battleId: battle.id };
  },

  /**
   * 处理战斗结束事件
   */
  async handleBattleEnd(userId: string, battleResult: any) {
    // 更新战斗记录
    if (battleResult.battleId) {
      await strapi.entityService.update('api::battle.battle', battleResult.battleId, {
        data: {
          result: battleResult.result,
          ended_at: new Date(),
          star_rating: battleResult.starRating,
          duration: battleResult.duration,
          turns: battleResult.turns,
          battle_log: battleResult.battleLog,
          rewards: battleResult.rewards,
          statistics: battleResult.statistics,
        },
      });
    }

    console.log(`⚔️ 战斗结束: 用户${userId}`, battleResult);

    // 发放奖励
    if (battleResult.rewards) {
      await this.giveRewards(userId, battleResult.rewards);
    }

    return { success: true };
  },

  /**
   * 处理英雄升级事件
   */
  async handleHeroUpgrade(userId: string, upgradeData: any) {
    // 更新英雄数据
    if (upgradeData.heroId) {
      await strapi.entityService.update('api::user-hero.user-hero', upgradeData.heroId, {
        data: {
          level: upgradeData.newLevel,
          experience: upgradeData.experience,
          stats: upgradeData.stats,
        },
      });
    }

    return { success: true };
  },

  /**
   * 发放奖励
   */
  async giveRewards(userId: string, rewards: any) {
    // 这里可以实现奖励发放逻辑
    console.log(`🎁 发放奖励给用户 ${userId}:`, rewards);
    
    // 例如：更新用户资源
    // await strapi.entityService.update('api::user-profile.user-profile', userProfileId, {
    //   data: {
    //     gold: currentGold + rewards.gold,
    //     gems: currentGems + rewards.gems,
    //   }
    // });
  },
};