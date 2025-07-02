import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 基础URL配置
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:1337/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // 从认证状态中获取token
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Hero',
    'Skill',
    'Equipment',
    'Item',
    'Formation',
    'Battle',
    'City',
    'Building',
    'Chapter',
    'Stage',
    'Summon',
  ],
  endpoints: (builder) => ({
    // 认证相关API
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    // 武将相关API - 用户拥有的武将
    getHeroes: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.order) searchParams.append('order', params.order);
        if (params.faction) searchParams.append('faction', params.faction);
        if (params.rarity) searchParams.append('rarity', params.rarity.toString());
        if (params.unitType) searchParams.append('unitType', params.unitType);
        return `/heroes?${searchParams.toString()}`;
      },
      providesTags: ['Hero'],
    }),
    getHero: builder.query({
      query: (id) => `/user-heroes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Hero', id }],
    }),
    
    // 获取武将模板详情（用于详情页面显示）
    getHeroTemplate: builder.query({
      query: (heroId) => `/heroes/${heroId}`,
      providesTags: (result, error, heroId) => [{ type: 'Hero', id: `template-${heroId}` }],
    }),
    
    // 武将图鉴API - 所有武将模板（改为调用公开的武将模板接口）
    getHeroLibrary: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append('page', '1');
        searchParams.append('limit', '100'); // 获取更多武将
        if (params.faction) searchParams.append('faction', params.faction);
        if (params.rarity) searchParams.append('rarity', params.rarity);
        return `/heroes?${searchParams.toString()}`;
      },
      providesTags: ['Hero'],
    }),
    
    // 武将升级API
    levelUpHero: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/heroes/${id}/level-up`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Hero', id }],
    }),

    // 武将升星API
    starUpHero: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/heroes/${id}/star-up`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Hero', id }],
    }),

    // 武将觉醒API
    awakenHero: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/heroes/${id}/awaken`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Hero', id }],
    }),
    
    // 武将召唤API
    summonHeroes: builder.mutation({
      query: (summonData) => ({
        url: '/heroes/summon',
        method: 'POST',
        body: summonData,
      }),
      invalidatesTags: ['Hero', 'User'],
    }),
    
    // 新手召唤API
    newbieSummon: builder.mutation({
      query: () => ({
        url: '/heroes/newbie-summon',
        method: 'POST',
      }),
      invalidatesTags: ['Hero', 'User'],
    }),

    // 用户档案API
    getUserProfile: builder.query({
      query: (userId) => `/user-profiles?filters[userId][$eq]=${userId}`,
      providesTags: ['User'],
    }),
    createUserProfile: builder.mutation({
      query: (data) => ({
        url: '/user-profiles',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/user-profiles/${id}`,
        method: 'PUT',
        body: { data },
      }),
      invalidatesTags: ['User'],
    }),

    // 用户英雄API - 获取当前用户的武将
    getUserHeroes: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.sort) searchParams.append('sort', params.sort);
        if (params.order) searchParams.append('order', params.order);
        return `/user-heroes?${searchParams.toString()}`;
      },
      providesTags: ['Hero'],
    }),
    createUserHero: builder.mutation({
      query: (data) => ({
        url: '/user-heroes',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['Hero'],
    }),
    updateUserHero: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/user-heroes/${id}`,
        method: 'PUT',
        body: { data },
      }),
      invalidatesTags: ['Hero'],
    }),

    // 技能系统API
    getSkills: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.skill_type) searchParams.append('skill_type', params.skill_type);
        if (params.damage_type) searchParams.append('damage_type', params.damage_type);
        if (params.hero_id) searchParams.append('hero_id', params.hero_id);
        return `/skills?${searchParams.toString()}`;
      },
      providesTags: ['Skill'],
    }),
    getSkill: builder.query({
      query: (id) => `/skills/${id}`,
      providesTags: (result, error, id) => [{ type: 'Skill', id }],
    }),
    getSkillsByType: builder.query({
      query: ({ type, ...params }) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        return `/skills/type/${type}?${searchParams.toString()}`;
      },
      providesTags: ['Skill'],
    }),
    getHeroSkills: builder.query({
      query: (heroId) => `/skills/hero/${heroId}`,
      providesTags: ['Skill'],
    }),
    getSkillStats: builder.query({
      query: () => '/skills/stats/overview',
      providesTags: ['Skill'],
    }),

    // 战斗API
    getBattleStages: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.difficulty) searchParams.append('difficulty', params.difficulty);
        if (params.chapter) searchParams.append('chapter', params.chapter);
        return `/battles/stages?${searchParams.toString()}`;
      },
      providesTags: ['Battle'],
    }),
    startBattle: builder.mutation({
      query: (battleData) => ({
        url: '/battles/start',
        method: 'POST',
        body: battleData,
      }),
      invalidatesTags: ['Battle'],
    }),
    executeAction: builder.mutation({
      query: ({ battleId, action }) => ({
        url: `/battles/${battleId}/action`,
        method: 'POST',
        body: action,
      }),
      invalidatesTags: ['Battle'],
    }),
    autoBattle: builder.mutation({
      query: (battleId) => ({
        url: `/battles/${battleId}/auto`,
        method: 'POST',
      }),
      invalidatesTags: ['Battle'],
    }),
    getBattleResult: builder.query({
      query: (battleId) => `/battles/${battleId}/result`,
      providesTags: (result, error, battleId) => [{ type: 'Battle', id: battleId }],
    }),

    // 章节API
    getChapters: builder.query({
      query: () => '/chapters',
      providesTags: ['Chapter'],
    }),
    getChapter: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: (result, error, id) => [{ type: 'Chapter', id }],
    }),

    // 关卡API
    getStages: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.chapter_id) searchParams.append('chapter_id', params.chapter_id);
        if (params.stage_type) searchParams.append('stage_type', params.stage_type);
        return `/stages?${searchParams.toString()}`;
      },
      providesTags: ['Stage'],
    }),
    getStage: builder.query({
      query: (id) => `/stages/${id}`,
      providesTags: (result, error, id) => [{ type: 'Stage', id }],
    }),
    startStageChallenge: builder.mutation({
      query: (stageId) => ({
        url: `/stages/${stageId}/challenge`,
        method: 'POST',
      }),
      invalidatesTags: ['Battle', 'User'],
    }),

    // 阵容系统API
    getFormations: builder.query({
      query: () => '/formations',
      providesTags: ['Formation'],
    }),
    getFormation: builder.query({
      query: (id) => `/formations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Formation', id }],
    }),
    createFormation: builder.mutation({
      query: (formationData) => ({
        url: '/formations',
        method: 'POST',
        body: formationData,
      }),
      invalidatesTags: ['Formation'],
    }),
    updateFormation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/formations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Formation', id }],
    }),
    deleteFormation: builder.mutation({
      query: (id) => ({
        url: `/formations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Formation'],
    }),
    copyFormation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/formations/${id}/copy`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Formation'],
    }),
    getRecommendedFormations: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.battle_type) searchParams.append('battle_type', params.battle_type);
        return `/formations/recommendations?${searchParams.toString()}`;
      },
      providesTags: ['Formation'],
    }),

    // 背包系统API - 物品模板
    getItemTemplates: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.category) searchParams.append('category', params.category);
        if (params.rarity) searchParams.append('rarity', params.rarity);
        return `/item-templates?${searchParams.toString()}`;
      },
      providesTags: ['Item'],
    }),
    getItemTemplate: builder.query({
      query: (id) => `/item-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Item', id }],
    }),
    getItemsByCategory: builder.query({
      query: ({ category, ...params }) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        return `/item-templates/category/${category}?${searchParams.toString()}`;
      },
      providesTags: ['Item'],
    }),
    getUsableItems: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        return `/item-templates/usable/list?${searchParams.toString()}`;
      },
      providesTags: ['Item'],
    }),

    // 背包系统API - 用户物品
    getUserItems: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.category) searchParams.append('category', params.category);
        if (params.rarity) searchParams.append('rarity', params.rarity);
        if (params.is_locked !== undefined) searchParams.append('is_locked', params.is_locked);
        return `/user-items?${searchParams.toString()}`;
      },
      providesTags: ['Item'],
    }),
    useItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/user-items/${id}/use`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Item', 'User'],
    }),
    toggleItemLock: builder.mutation({
      query: ({ id, is_locked }) => ({
        url: `/user-items/${id}/lock`,
        method: 'PUT',
        body: { is_locked },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Item', id }],
    }),
    sellItems: builder.mutation({
      query: (items) => ({
        url: '/user-items/sell',
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['Item', 'User'],
    }),
    addItem: builder.mutation({
      query: (itemData) => ({
        url: '/user-items/add',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['Item'],
    }),

    // 召唤系统API
    normalSummon: builder.mutation({
      query: (data) => ({
        url: '/summon/normal',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Summon', 'Hero', 'User'],
    }),
    premiumSummon: builder.mutation({
      query: (data) => ({
        url: '/summon/premium',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Summon', 'Hero', 'User'],
    }),
    getSummonHistory: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        return `/summon/history?${searchParams.toString()}`;
      },
      providesTags: ['Summon'],
    }),
    getSummonRates: builder.query({
      query: () => '/summon/rates',
      providesTags: ['Summon'],
    }),
    synthesizeHero: builder.mutation({
      query: (data) => ({
        url: '/summon/synthesize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Summon', 'Hero', 'Item'],
    }),
  }),
});

// 导出hooks将由具体的API slice自动生成
export const {
  // 认证相关
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  // 武将相关
  useGetHeroesQuery,
  useGetHeroQuery,
  useGetHeroTemplateQuery,
  useGetHeroLibraryQuery,
  useLevelUpHeroMutation,
  useStarUpHeroMutation,
  useAwakenHeroMutation,
  useSummonHeroesMutation,
  useNewbieSummonMutation,
  // 用户档案
  useGetUserProfileQuery,
  useCreateUserProfileMutation,
  useUpdateUserProfileMutation,
  // 用户英雄
  useGetUserHeroesQuery,
  useCreateUserHeroMutation,
  useUpdateUserHeroMutation,
  // 技能系统
  useGetSkillsQuery,
  useGetSkillQuery,
  useGetSkillsByTypeQuery,
  useGetHeroSkillsQuery,
  useGetSkillStatsQuery,
  // 战斗
  useGetBattleStagesQuery,
  useStartBattleMutation,
  useExecuteActionMutation,
  useAutoBattleMutation,
  useGetBattleResultQuery,
  // 章节
  useGetChaptersQuery,
  useGetChapterQuery,
  // 关卡
  useGetStagesQuery,
  useGetStageQuery,
  useStartStageChallengeMutation,
  // 阵容
  useGetFormationsQuery,
  useGetFormationQuery,
  useCreateFormationMutation,
  useUpdateFormationMutation,
  useDeleteFormationMutation,
  useCopyFormationMutation,
  useGetRecommendedFormationsQuery,
  // 背包系统 - 物品模板
  useGetItemTemplatesQuery,
  useGetItemTemplateQuery,
  useGetItemsByCategoryQuery,
  useGetUsableItemsQuery,
  // 背包系统 - 用户物品
  useGetUserItemsQuery,
  useUseItemMutation,
  useToggleItemLockMutation,
  useSellItemsMutation,
  useAddItemMutation,
  // 召唤系统
  useNormalSummonMutation,
  usePremiumSummonMutation,
  useGetSummonHistoryQuery,
  useGetSummonRatesQuery,
  useSynthesizeHeroMutation,
} = apiSlice;
