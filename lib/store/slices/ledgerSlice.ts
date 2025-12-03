import { LedgerEntry, Organization, Transaction } from '@/lib/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LedgerState {
    entries: LedgerEntry[];
}

const initialState: LedgerState = {
    entries: [],
};

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState,
    reducers: {
        setLedger: (state, action: PayloadAction<LedgerEntry[]>) => {
            state.entries = action.payload;
        },
        addOrganization: (state, action: PayloadAction<Organization>) => {
            state.entries.push({ organization: action.payload, transactions: [] });
        },
        addTransaction: (state, action: PayloadAction<{ organizationId: string; transaction: Transaction }>) => {
            const entry = state.entries.find((e) => e.organization.id === action.payload.organizationId);
            if (entry) {
                entry.transactions.push(action.payload.transaction);
            }
        },
    },
});

export const { setLedger, addOrganization, addTransaction } = ledgerSlice.actions;
export default ledgerSlice.reducer;
