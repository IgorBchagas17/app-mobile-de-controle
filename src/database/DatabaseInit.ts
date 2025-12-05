import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('oficina_v2.db');

    // --- 1. Criação das 3 Tabelas ---
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Tabela de Serviços (cada trabalho realizado ou agendado)
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        location TEXT,
        isCompleted INTEGER NOT NULL
      );
      
      -- Tabela de Financeiro (Entrada e Saída de caixa)
      CREATE TABLE IF NOT EXISTS finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,         -- 'entrada' ou 'saida'
        description TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL
      );
      
      -- Tabela de TIPOS DE SERVIÇOS (Catálogo fixo, sem valor)
      CREATE TABLE IF NOT EXISTS service_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );
    `);

    // --- 2. Semeadura (Seed) do Catálogo de Serviços FIXOS ---
    
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM service_types');
    const typeCount = countResult?.count ?? 0;

    if (typeCount === 0) {
      console.log('Sem tipos de serviço, inserindo catálogo...');
      
      // Lista de Tipos de Serviço Fixos (Apenas o nome)
      const initialTypes = [
        'Elétrica',
        'Hidráulica',
        'Manutenção Geral',
        'Instalação/Montagem',
        'Emergência (Fora Horário)',
        'Outros'
      ];

      // Insere cada tipo na tabela
      for (const name of initialTypes) {
        await db.runAsync(
          'INSERT INTO service_types (name) VALUES (?)',
          [name]
        );
      }
      console.log('Catálogo de serviços semeado com sucesso!');
    } else {
      console.log(`Catálogo com ${typeCount} tipos já existente.`);
    }

    return db;
  } catch (error) {
    console.error("Erro ao iniciar ou semear o banco:", error);
  }
};