import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Item, InventoryItem } from '../../types';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    rarity: number | null;
    name: string | null;
  };
  sortBy: 'name' | 'rarity' | 'quantity';
  sortOrder: 'asc' | 'desc';
}

const initialState: InventoryState = {
  items: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    rarity: null,
    name: null,
  },
  sortBy: 'name',
  sortOrder: 'asc',
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
    },
    addItem: (
      state,
      action: PayloadAction<{ item: Item; quantity: number }>
    ) => {
      const existingItem = state.items.find(
        invItem => invItem.item.id === action.payload.item.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({
          item: action.payload.item,
          quantity: action.payload.quantity,
        });
      }
    },
    removeItem: (
      state,
      action: PayloadAction<{ itemId: number; quantity?: number }>
    ) => {
      const index = state.items.findIndex(
        invItem => invItem.item.id === action.payload.itemId
      );
      if (index !== -1) {
        if (action.payload.quantity) {
          state.items[index].quantity -= action.payload.quantity;
          if (state.items[index].quantity <= 0) {
            state.items.splice(index, 1);
          }
        } else {
          state.items.splice(index, 1);
        }
      }
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ itemId: number; quantity: number }>
    ) => {
      const item = state.items.find(
        invItem => invItem.item.id === action.payload.itemId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            invItem => invItem.item.id !== action.payload.itemId
          );
        }
      }
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<InventoryState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: state => {
      state.filters = {
        category: null,
        rarity: null,
        name: null,
      };
    },
    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: InventoryState['sortBy'];
        sortOrder: InventoryState['sortOrder'];
      }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
  },
});

export const {
  setLoading,
  setError,
  setItems,
  addItem,
  removeItem,
  updateItemQuantity,
  setFilters,
  clearFilters,
  setSorting,
} = inventorySlice.actions;

export default inventorySlice.reducer;

// 选择器
export const selectInventoryItems = (state: { inventory: InventoryState }) =>
  state.inventory.items;
export const selectInventoryLoading = (state: { inventory: InventoryState }) =>
  state.inventory.isLoading;
export const selectInventoryError = (state: { inventory: InventoryState }) =>
  state.inventory.error;

export const selectFilteredInventory = (state: {
  inventory: InventoryState;
}) => {
  const { items, filters, sortBy, sortOrder } = state.inventory;

  const filtered = items.filter(invItem => {
    if (filters.category && invItem.item.item_type !== filters.category)
      return false;
    if (filters.rarity && invItem.item.rarity !== filters.rarity) return false;
    if (
      filters.name &&
      !invItem.item.name.toLowerCase().includes(filters.name.toLowerCase())
    )
      return false;
    return true;
  });

  // 排序
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.item.name.toLowerCase();
        bValue = b.item.name.toLowerCase();
        break;
      case 'rarity':
        aValue = a.item.rarity;
        bValue = b.item.rarity;
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        return 0;
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};
