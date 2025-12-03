import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import inventoryReducer, { setCollections } from './slices/inventorySlice';
import ledgerReducer, { setLedger } from './slices/ledgerSlice';
import { db } from '@/lib/db';

const listenerMiddleware = createListenerMiddleware();

// Listener to save state changes to DB
listenerMiddleware.startListening({
    predicate: (action, currentState, previousState) => {
        return true; // Naive: save on every action for now. Optimize later.
    },
    effect: async (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        await db.write({
            meta: {
                appVersion: '1.0.0',
                exportDate: new Date().toISOString(),
                userCurrency: 'USD',
            },
            collections: state.inventory.collections,
            ledger: state.ledger.entries,
        });
    },
});

export const store = configureStore({
    reducer: {
        inventory: inventoryReducer,
        ledger: ledgerReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Initialize store from DB
db.init().then((data) => {
    store.dispatch(setCollections(data.collections));
    store.dispatch(setLedger(data.ledger));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
