import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
  try {
    // MUDANÇA CRÍTICA: Novo nome para forçar a recriação do banco com o novo esquema
    const db = await SQLite.openDatabaseAsync('oficina_v3.db'); 

    // 1. Criação das 3 Tabelas
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      -- Tabela de Serviços COM A NOVA COLUNA serviceTypeId
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serviceTypeId INTEGER, -- AGORA COM A COLUNA PARA O TIPO DE SERVIÇO
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

    // 2. Semeadura (Seed) do Catálogo de Serviços FIXOS
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM service_types');
    const typeCount = countResult?.count ?? 0;

    if (typeCount === 0) {
      const initialTypes = ['Elétrica', 'Hidráulica', 'Manutenção Geral', 'Instalação/Montagem', 'Emergência (Fora Horário)'];
      for (const name of initialTypes) {
        await db.runAsync('INSERT INTO service_types (name) VALUES (?)', [name]);
      }
    }
    return db;
  } catch (error) {
    console.error("Erro ao iniciar ou atualizar o banco:", error);
  }
};