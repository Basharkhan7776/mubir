import * as FileSystem from 'expo-file-system/legacy';
import { DatabaseSchema } from './types';

const DB_FILE = FileSystem.documentDirectory + 'mudir_db.json';

const INITIAL_DB: DatabaseSchema = {
    meta: {
        appVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        userCurrency: 'USD',
    },
    collections: [],
    ledger: [],
};

class JsonDb {
    async init(): Promise<DatabaseSchema> {
        const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
        if (!fileInfo.exists) {
            await this.write(INITIAL_DB);
            return INITIAL_DB;
        }
        return this.read();
    }

    async read(): Promise<DatabaseSchema> {
        try {
            const content = await FileSystem.readAsStringAsync(DB_FILE);
            return JSON.parse(content);
        } catch (error) {
            console.error('Failed to read DB:', error);
            return INITIAL_DB;
        }
    }

    async write(data: DatabaseSchema): Promise<void> {
        try {
            await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to write DB:', error);
        }
    }
}

export const db = new JsonDb();
