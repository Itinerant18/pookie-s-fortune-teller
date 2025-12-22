import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PredictionsState {
  all: any[];
  selected: any | null;
  filters: {
    type: 'all' | 'income' | 'health' | 'relationships';
    period: string;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PredictionsState = {
  all: [],
  selected: null,
  filters: {
    type: 'all',
    period: '6months',
  },
  loading: false,
  error: null,
};

const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setPredictions(state, action: PayloadAction<any[]>) {
      state.all = action.payload;
      state.loading = false;
    },
    setSelectedPrediction(state, action: PayloadAction<any>) {
      state.selected = action.payload;
    },
    setFilter(state, action: PayloadAction<Partial<PredictionsState['filters']>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setPredictions, setSelectedPrediction, setFilter, setLoading, setError } = predictionsSlice.actions;
export default predictionsSlice.reducer;
