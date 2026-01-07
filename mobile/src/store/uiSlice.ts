// mobile/src/store/uiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
}

interface UIState {
  theme: ThemeMode;
  currentScreen: string;
  notificationsEnabled: boolean;
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  lastSyncTime: number | null;
  isModalVisible: boolean;
  modalType: string | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'warning' | 'info' | null;
}

const initialState: UIState = {
  theme: 'system',
  currentScreen: 'Dashboard',
  notificationsEnabled: true,
  isOnline: true,
  syncQueue: [],
  lastSyncTime: null,
  isModalVisible: false,
  modalType: null,
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setCurrentScreen(state, action: PayloadAction<string>) {
      state.currentScreen = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    addToSyncQueue(state, action: PayloadAction<Omit<SyncQueueItem, 'id' | 'timestamp'>>) {
      const newItem: SyncQueueItem = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      };
      state.syncQueue.push(newItem);
    },
    removeFromSyncQueue(state, action: PayloadAction<string>) {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload);
    },
    clearSyncQueue(state) {
      state.syncQueue = [];
      state.lastSyncTime = Date.now();
    },
    setLastSyncTime(state, action: PayloadAction<number>) {
      state.lastSyncTime = action.payload;
    },
    showModal(state, action: PayloadAction<string>) {
      state.isModalVisible = true;
      state.modalType = action.payload;
    },
    hideModal(state) {
      state.isModalVisible = false;
      state.modalType = null;
    },
    showToast(state, action: PayloadAction<{ message: string; type: UIState['toastType'] }>) {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    hideToast(state) {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const {
  setTheme,
  setCurrentScreen,
  setNotificationsEnabled,
  setOnlineStatus,
  addToSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  setLastSyncTime,
  showModal,
  hideModal,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;
