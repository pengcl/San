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
        if (params.page) searchParams.append('page', params.page);
        if (params.pageSize) searchParams.append('pageSize', params.pageSize);
        if (params.sort) searchParams.append('sort', params.sort);
        return `/user-heroes?${searchParams.toString()}`;
      },
      providesTags: ['Hero'],
    }),
    getHero: builder.query({
      query: (id) => `/user-heroes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Hero', id }],
    }),
    
    // 武将图鉴API - 所有武将模板
    getHeroLibrary: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.faction) searchParams.append('faction', params.faction);
        if (params.rarity) searchParams.append('rarity', params.rarity);
        if (params.owned !== undefined) searchParams.append('owned', params.owned);
        return `/heroes/library?${searchParams.toString()}`;
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

    // 用户英雄API
    getUserHeroes: builder.query({
      query: (userId) => `/user-heroes?filters[userId][$eq]=${userId}&populate=*`,
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

    // 技能API
    getSkills: builder.query({
      query: () => '/skills',
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
  useGetHeroLibraryQuery,
  useLevelUpHeroMutation,
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
  // 技能
  useGetSkillsQuery,
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
} = apiSlice;
