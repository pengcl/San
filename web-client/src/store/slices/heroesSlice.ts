import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Hero } from '../../types';

interface HeroesState {
  heroes: Hero[];
  selectedHero: Hero | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    faction: string | null;
    rarity: number | null;
    role: string | null;
    level: { min: number; max: number } | null;
  };
  sortBy: 'name' | 'level' | 'rarity' | 'faction' | 'role';
  sortOrder: 'asc' | 'desc';
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: HeroesState = {
  heroes: [],
  selectedHero: null,
  isLoading: false,
  error: null,
  filters: {
    faction: null,
    rarity: null,
    role: null,
    level: null,
  },
  sortBy: 'level',
  sortOrder: 'desc',
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

const heroesSlice = createSlice({
  name: 'heroes',
  initialState,
  reducers: {
    // 加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 英雄数据
    setHeroes: (state, action: PayloadAction<Hero[]>) => {
      state.heroes = action.payload;
      state.error = null;
    },
    addHero: (state, action: PayloadAction<Hero>) => {
      state.heroes.push(action.payload);
    },
    updateHero: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<Hero> }>
    ) => {
      const index = state.heroes.findIndex(
        hero => hero.id === action.payload.id
      );
      if (index !== -1) {
        state.heroes[index] = {
          ...state.heroes[index],
          ...action.payload.updates,
        };
      }
      // 如果更新的是当前选中的英雄，也更新selectedHero
      if (state.selectedHero && state.selectedHero.id === action.payload.id) {
        state.selectedHero = {
          ...state.selectedHero,
          ...action.payload.updates,
        };
      }
    },
    removeHero: (state, action: PayloadAction<number>) => {
      state.heroes = state.heroes.filter(hero => hero.id !== action.payload);
      if (state.selectedHero && state.selectedHero.id === action.payload) {
        state.selectedHero = null;
      }
    },

    // 选中英雄
    selectHero: (state, action: PayloadAction<Hero | null>) => {
      state.selectedHero = action.payload;
    },

    // 英雄升级
    levelUpHero: (
      state,
      action: PayloadAction<{
        id: number;
        newLevel: number;
        newExperience: number;
      }>
    ) => {
      const hero = state.heroes.find(h => h.id === action.payload.id);
      if (hero) {
        hero.level = action.payload.newLevel;
        hero.experience = action.payload.newExperience;
      }
      if (state.selectedHero && state.selectedHero.id === action.payload.id) {
        state.selectedHero.level = action.payload.newLevel;
        state.selectedHero.experience = action.payload.newExperience;
      }
    },

    // 筛选和排序
    setFilters: (
      state,
      action: PayloadAction<Partial<HeroesState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // 重置到第一页
    },
    clearFilters: state => {
      state.filters = {
        faction: null,
        rarity: null,
        role: null,
        level: null,
      };
      state.pagination.page = 1;
    },
    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: HeroesState['sortBy'];
        sortOrder: HeroesState['sortOrder'];
      }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // 分页
    setPagination: (
      state,
      action: PayloadAction<Partial<HeroesState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    nextPage: state => {
      const maxPage = Math.ceil(
        state.pagination.total / state.pagination.pageSize
      );
      if (state.pagination.page < maxPage) {
        state.pagination.page += 1;
      }
    },
    prevPage: state => {
      if (state.pagination.page > 1) {
        state.pagination.page -= 1;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setHeroes,
  addHero,
  updateHero,
  removeHero,
  selectHero,
  levelUpHero,
  setFilters,
  clearFilters,
  setSorting,
  setPagination,
  nextPage,
  prevPage,
} = heroesSlice.actions;

export default heroesSlice.reducer;

// 选择器
export const selectHeroes = (state: { heroes: HeroesState }) =>
  state.heroes.heroes;
export const selectSelectedHero = (state: { heroes: HeroesState }) =>
  state.heroes.selectedHero;
export const selectHeroesLoading = (state: { heroes: HeroesState }) =>
  state.heroes.isLoading;
export const selectHeroesError = (state: { heroes: HeroesState }) =>
  state.heroes.error;
export const selectHeroesFilters = (state: { heroes: HeroesState }) =>
  state.heroes.filters;
export const selectHeroesSorting = (state: { heroes: HeroesState }) => ({
  sortBy: state.heroes.sortBy,
  sortOrder: state.heroes.sortOrder,
});
export const selectHeroesPagination = (state: { heroes: HeroesState }) =>
  state.heroes.pagination;

// 复合选择器
export const selectFilteredHeroes = (state: { heroes: HeroesState }) => {
  const { heroes, filters, sortBy, sortOrder } = state.heroes;

  const filtered = heroes.filter(hero => {
    if (filters.faction && hero.faction !== filters.faction) return false;
    if (filters.rarity && hero.rarity !== filters.rarity) return false;
    if (filters.role && hero.role !== filters.role) return false;
    if (
      filters.level &&
      (hero.level < filters.level.min || hero.level > filters.level.max)
    )
      return false;
    return true;
  });

  // 排序
  filtered.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

export const selectPaginatedHeroes = (state: { heroes: HeroesState }) => {
  const filtered = selectFilteredHeroes(state);
  const { page, pageSize } = state.heroes.pagination;
  const startIndex = (page - 1) * pageSize;
  return filtered.slice(startIndex, startIndex + pageSize);
};
