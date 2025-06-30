import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { City, Building } from '../../types';

interface CityState {
  cities: City[];
  selectedCity: City | null;
  buildings: Building[];
  isLoading: boolean;
  error: string | null;
  // 建筑升级状态
  upgradingBuildings: number[];
  // 资源生产
  resources: {
    gold: number;
    food: number;
    wood: number;
    stone: number;
    lastUpdate: number;
  };
}

const initialState: CityState = {
  cities: [],
  selectedCity: null,
  buildings: [],
  isLoading: false,
  error: null,
  upgradingBuildings: [],
  resources: {
    gold: 0,
    food: 0,
    wood: 0,
    stone: 0,
    lastUpdate: Date.now(),
  },
};

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    // 城池管理
    setCities: (state, action: PayloadAction<City[]>) => {
      state.cities = action.payload;
    },
    addCity: (state, action: PayloadAction<City>) => {
      state.cities.push(action.payload);
    },
    updateCity: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<City> }>
    ) => {
      const index = state.cities.findIndex(
        city => city.id === action.payload.id
      );
      if (index !== -1) {
        state.cities[index] = {
          ...state.cities[index],
          ...action.payload.updates,
        };
      }
      if (state.selectedCity && state.selectedCity.id === action.payload.id) {
        state.selectedCity = {
          ...state.selectedCity,
          ...action.payload.updates,
        };
      }
    },
    selectCity: (state, action: PayloadAction<City | null>) => {
      state.selectedCity = action.payload;
    },

    // 建筑管理
    setBuildings: (state, action: PayloadAction<Building[]>) => {
      state.buildings = action.payload;
    },
    addBuilding: (state, action: PayloadAction<Building>) => {
      state.buildings.push(action.payload);
    },
    updateBuilding: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<Building> }>
    ) => {
      const index = state.buildings.findIndex(
        building => building.id === action.payload.id
      );
      if (index !== -1) {
        state.buildings[index] = {
          ...state.buildings[index],
          ...action.payload.updates,
        };
      }
    },
    removeBuilding: (state, action: PayloadAction<number>) => {
      state.buildings = state.buildings.filter(
        building => building.id !== action.payload
      );
    },

    // 建筑升级
    startBuildingUpgrade: (state, action: PayloadAction<number>) => {
      if (!state.upgradingBuildings.includes(action.payload)) {
        state.upgradingBuildings.push(action.payload);
      }
    },
    finishBuildingUpgrade: (state, action: PayloadAction<number>) => {
      state.upgradingBuildings = state.upgradingBuildings.filter(
        id => id !== action.payload
      );
      // 更新建筑等级
      const building = state.buildings.find(b => b.id === action.payload);
      if (building) {
        building.level += 1;
      }
    },
    cancelBuildingUpgrade: (state, action: PayloadAction<number>) => {
      state.upgradingBuildings = state.upgradingBuildings.filter(
        id => id !== action.payload
      );
    },

    // 资源管理
    updateResources: (
      state,
      action: PayloadAction<Partial<CityState['resources']>>
    ) => {
      state.resources = {
        ...state.resources,
        ...action.payload,
        lastUpdate: Date.now(),
      };
    },
    addResources: (
      state,
      action: PayloadAction<{
        gold?: number;
        food?: number;
        wood?: number;
        stone?: number;
      }>
    ) => {
      if (action.payload.gold) state.resources.gold += action.payload.gold;
      if (action.payload.food) state.resources.food += action.payload.food;
      if (action.payload.wood) state.resources.wood += action.payload.wood;
      if (action.payload.stone) state.resources.stone += action.payload.stone;
      state.resources.lastUpdate = Date.now();
    },
    consumeResources: (
      state,
      action: PayloadAction<{
        gold?: number;
        food?: number;
        wood?: number;
        stone?: number;
      }>
    ) => {
      if (action.payload.gold)
        state.resources.gold = Math.max(
          0,
          state.resources.gold - action.payload.gold
        );
      if (action.payload.food)
        state.resources.food = Math.max(
          0,
          state.resources.food - action.payload.food
        );
      if (action.payload.wood)
        state.resources.wood = Math.max(
          0,
          state.resources.wood - action.payload.wood
        );
      if (action.payload.stone)
        state.resources.stone = Math.max(
          0,
          state.resources.stone - action.payload.stone
        );
      state.resources.lastUpdate = Date.now();
    },

    // 状态管理
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCities,
  addCity,
  updateCity,
  selectCity,
  setBuildings,
  addBuilding,
  updateBuilding,
  removeBuilding,
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  updateResources,
  addResources,
  consumeResources,
  setLoading,
  setError,
} = citySlice.actions;

export default citySlice.reducer;

// 选择器
export const selectCities = (state: { city: CityState }) => state.city.cities;
export const selectSelectedCity = (state: { city: CityState }) =>
  state.city.selectedCity;
export const selectBuildings = (state: { city: CityState }) =>
  state.city.buildings;
export const selectCityLoading = (state: { city: CityState }) =>
  state.city.isLoading;
export const selectCityError = (state: { city: CityState }) => state.city.error;
export const selectUpgradingBuildings = (state: { city: CityState }) =>
  state.city.upgradingBuildings;
export const selectResources = (state: { city: CityState }) =>
  state.city.resources;

// 复合选择器
export const selectCityBuildings = (state: { city: CityState }) => {
  const { selectedCity, buildings } = state.city;
  if (!selectedCity) return [];
  return buildings.filter(building =>
    selectedCity.buildings.some(cityBuilding => cityBuilding.id === building.id)
  );
};

export const selectBuildingsByType = (
  state: { city: CityState },
  buildingType: string
) => {
  return state.city.buildings.filter(
    building => building.building_type === buildingType
  );
};
