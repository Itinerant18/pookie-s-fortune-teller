import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import predictionsReducer from './predictionsSlice';
// import uiReducer from './uiSlice'; // Will add later if needed

export const store = configureStore({
  reducer: {
    auth: authReducer,
    predictions: predictionsReducer,
    // ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
