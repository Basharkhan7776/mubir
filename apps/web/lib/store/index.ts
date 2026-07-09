import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import inventoryReducer, { setCollections } from "./slices/inventorySlice";
import ledgerReducer, { setLedger } from "./slices/ledgerSlice";
import settingsReducer, { setSettings } from "./slices/settingsSlice";
import authReducer from "./slices/authSlice";
import receiptsReducer, { setReceipts } from "./slices/receiptsSlice";
import {
  loadData,
  saveData,
  hasLocalData,
  type AppData,
} from "@/lib/local-data";

const listenerMiddleware = createListenerMiddleware();

// Persist Redux app data to localStorage (debounced)
listenerMiddleware.startListening({
  predicate: (action) => {
    const type = String(action.type);
    return (
      type.startsWith("inventory/") ||
      type.startsWith("ledger/") ||
      type.startsWith("receipts/") ||
      type.startsWith("settings/")
    );
  },
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(400);

    const state = listenerApi.getState() as RootState;
    const data: AppData = {
      meta: {
        appVersion: state.settings.appVersion,
        exportDate: new Date().toISOString(),
        userCurrency: state.settings.userCurrency,
        organizationName: state.settings.organizationName,
        isNewUser: state.settings.isNewUser,
      },
      collections: state.inventory.collections,
      ledger: state.ledger.entries,
      receipts: state.receipts.list,
    };
    saveData(data);
  },
});

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    ledger: ledgerReducer,
    settings: settingsReducer,
    auth: authReducer,
    receipts: receiptsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

/** Hydrate Redux from localStorage (no network). Safe to call multiple times. */
export function hydrateStoreFromLocal(): boolean {
  if (!hasLocalData()) return false;
  try {
    const data = loadData();
    store.dispatch(setCollections(data.collections || []));
    store.dispatch(setLedger(data.ledger || []));
    store.dispatch(setSettings(data.meta));
    store.dispatch(setReceipts(data.receipts || []));
    return true;
  } catch (e) {
    console.error("Failed to hydrate store from localStorage", e);
    return false;
  }
}

/** Replace all app data slices from a full DatabaseSchema (e.g. after download). */
export function applyAppData(data: AppData) {
  store.dispatch(setCollections(data.collections || []));
  store.dispatch(setLedger(data.ledger || []));
  store.dispatch(setSettings(data.meta));
  store.dispatch(setReceipts(data.receipts || []));
}

// Initial hydrate if local data already exists
hydrateStoreFromLocal();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
