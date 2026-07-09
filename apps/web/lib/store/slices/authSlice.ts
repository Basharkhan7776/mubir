import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  lastSync: string | null;
  isSyncing: boolean;
  /** Set after a successful /status check this SPA session — never re-fetch status on page switches */
  serverDataVerified: boolean;
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  lastSync: null,
  isSyncing: false,
  serverDataVerified: false,
  isBootstrapping: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isLoggedIn = action.payload !== null;
    },
    setLastSync: (state, action: PayloadAction<string | null>) => {
      state.lastSync = action.payload;
    },
    setIsSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setServerDataVerified: (state, action: PayloadAction<boolean>) => {
      state.serverDataVerified = action.payload;
    },
    setIsBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.isBootstrapping = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.lastSync = null;
      state.serverDataVerified = false;
      state.isBootstrapping = false;
      state.isSyncing = false;
    },
  },
});

export const {
  setUser,
  setLastSync,
  setIsSyncing,
  setServerDataVerified,
  setIsBootstrapping,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
