import * as FileSystem from 'expo-file-system/legacy';
import { DatabaseSchema } from './types';
import { seedData } from './seedData';

const DB_FILE = FileSystem.documentDirectory + 'mudir_db.json';

const INITIAL_DB: DatabaseSchema = seedData;

class JsonDb {
    async init(): Promise<DatabaseSchema> {
        try {
            console.log('Initializing DB at path:', DB_FILE);
            const fileInfo = await FileSystem.getInfoAsync(DB_FILE);
            console.log('File info:', fileInfo);
            if (!fileInfo.exists) {
                console.log('DB file does not exist, creating with initial data');
                await this.write(INITIAL_DB);
                return INITIAL_DB;
            }
            console.log('DB file exists, reading data');
            return this.read();
        } catch (error) {
            console.error('Error in DB init:', error);
            return INITIAL_DB;
        }
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
