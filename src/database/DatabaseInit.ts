import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
  try {
    // MUDANÇA: V4 para garantir banco novo
    const db = await SQLite.openDatabaseAsync('oficina_v4.db'); 

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serviceTypeId INTEGER, 
        description TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        location TEXT,
        isCompleted INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS service_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );
    `);

    // Semeadura (Seed)
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM service_types');
    if ((countResult?.count ?? 0) === 0) {
        const initialTypes = ['Elétrica', 'Hidráulica', 'Alvenaria', 'Pintura', 'Outros'];
        for (const name of initialTypes) {
            await db.runAsync('INSERT INTO service_types (name) VALUES (?)', [name]);
        }
    }
    
    return db;
  } catch (error) {
    console.error("Erro InitDB:", error);
  }
};