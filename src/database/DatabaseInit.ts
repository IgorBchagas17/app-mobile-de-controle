import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
  try {
    // Mudei o nome para v2 para ignorar qualquer banco antigo corrompido
    const db = await SQLite.openDatabaseAsync('oficina_v2.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        location TEXT,
        isCompleted INTEGER NOT NULL
      );
    `);

    console.log('Banco de dados (v2) pronto!');
    return db;
  } catch (error) {
    console.error("Erro ao iniciar o banco:", error);
  }
};