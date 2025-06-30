/**
 * 关卡数据导入脚本
 * 用于初始化章节和关卡数据
 */

import type { Core } from '@strapi/strapi';
import stageData from './chapters-stages-data.json';

export async function importStageData(strapi: Core.Strapi) {
  try {
    console.log('开始导入关卡数据...');

    // 1. 导入章节数据
    console.log('导入章节数据...');
    for (const chapter of stageData.chapters) {
      const existingChapter = await strapi.db.query('api::chapter.chapter').findOne({
        where: { chapter_id: chapter.chapter_id }
      });

      if (!existingChapter) {
        await strapi.db.query('api::chapter.chapter').create({
          data: chapter
        });
        console.log(`章节 ${chapter.name} 导入成功`);
      } else {
        console.log(`章节 ${chapter.name} 已存在，跳过`);
      }
    }

    // 2. 导入关卡数据
    console.log('导入关卡数据...');
    for (const stage of stageData.stages) {
      const existingStage = await strapi.db.query('api::stage.stage').findOne({
        where: { stage_id: stage.stage_id }
      });

      if (!existingStage) {
        // 查找对应的章节
        const chapter = await strapi.db.query('api::chapter.chapter').findOne({
          where: { chapter_id: stage.chapter_id }
        });

        if (chapter) {
          const stageDataToCreate = {
            ...stage,
            chapter: chapter.id
          };
          delete stageDataToCreate.chapter_id;

          await strapi.db.query('api::stage.stage').create({
            data: stageDataToCreate
          });
          console.log(`关卡 ${stage.name} 导入成功`);
        } else {
          console.error(`关卡 ${stage.name} 的章节不存在`);
        }
      } else {
        console.log(`关卡 ${stage.name} 已存在，跳过`);
      }
    }

    // 3. 导入关卡奖励数据
    console.log('导入关卡奖励数据...');
    for (const reward of stageData.stage_rewards) {
      // 查找对应的关卡
      const stage = await strapi.db.query('api::stage.stage').findOne({
        where: { stage_id: reward.stage_id }
      });

      if (stage) {
        const existingReward = await strapi.db.query('api::stage-reward.stage-reward').findOne({
          where: {
            stage: stage.id,
            reward_type: reward.reward_type,
            resource_type: reward.resource_type,
            resource_id: reward.resource_id
          }
        });

        if (!existingReward) {
          const rewardDataToCreate = {
            ...reward,
            stage: stage.id
          };
          delete rewardDataToCreate.stage_id;

          await strapi.db.query('api::stage-reward.stage-reward').create({
            data: rewardDataToCreate
          });
          console.log(`关卡奖励 ${reward.stage_id} - ${reward.resource_type} 导入成功`);
        } else {
          console.log(`关卡奖励已存在，跳过`);
        }
      } else {
        console.error(`奖励对应的关卡 ${reward.stage_id} 不存在`);
      }
    }

    console.log('关卡数据导入完成！');
  } catch (error) {
    console.error('关卡数据导入失败:', error);
    throw error;
  }
}

// 可以在 bootstrap 中调用此函数
export default importStageData;