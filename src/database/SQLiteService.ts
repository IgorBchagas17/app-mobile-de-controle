import * as SQLite from 'expo-sqlite';
import { ServiceModel, ServiceTypeModel, FinanceModel } from './types';

// Garante que estamos usando o mesmo banco novo
const getDb = async () => {
  return await SQLite.openDatabaseAsync('oficina_v2.db');
};

// --- Funções de SERVIÇOS (Trabalho) ---

export const addService = async (service: ServiceModel) => {
  const db = await getDb();
  
  const result = await db.runAsync(
    // Adicionamos serviceTypeId na lista de colunas
    'INSERT INTO services (serviceTypeId, description, value, date, location, isCompleted) VALUES (?, ?, ?, ?, ?, ?)', 
    [
      service.serviceTypeId, // NOVO CAMPO AQUI (agora com 6 parâmetros)
      service.description,
      service.value,
      service.date,
      service.location,
      service.isCompleted,
    ]
  );
  console.log('Serviço salvo com ID:', result.lastInsertRowId);
};

export const getServices = async () => {
  const db = await getDb();
  const allRows = await db.getAllAsync<ServiceModel>(
    'SELECT * FROM services ORDER BY date DESC'
  );
  return allRows;
};

export const updateServiceStatus = async (id: number, isCompleted: number) => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE services SET isCompleted = ? WHERE id = ?',
    [isCompleted, id]
  );
};

export const deleteService = async (id: number) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM services WHERE id = ?', [id]);
};

// --- Funções de TIPOS DE SERVIÇOS (Catálogo) ---

export const getServiceTypes = async () => {
    const db = await getDb();
    const allTypes = await db.getAllAsync<ServiceTypeModel>(
        'SELECT id, name FROM service_types ORDER BY name ASC'
    );
    return allTypes;
};

// --- Funções de FINANÇAS (Controle de Caixa) ---

export const addFinanceEntry = async (entry: FinanceModel) => {
    const db = await getDb();
    await db.runAsync(
        'INSERT INTO finance (type, description, value, date) VALUES (?, ?, ?, ?)',
        [entry.type, entry.description, entry.value, entry.date]
    );
    console.log(`Transação ${entry.type} salva.`);
};

export const getFinanceEntries = async () => {
    const db = await getDb();
    const allEntries = await db.getAllAsync<FinanceModel>(
        'SELECT * FROM finance ORDER BY date DESC'
    );
    return allEntries;
};

export const getFinanceBalance = async () => {
    const db = await getDb();
    const result = await db.getFirstAsync<{ total_entrada: number, total_saida: number }>(`
        SELECT
            SUM(CASE WHEN type = 'entrada' THEN value ELSE 0 END) as total_entrada,
            SUM(CASE WHEN type = 'saida' THEN value ELSE 0 END) as total_saida
        FROM finance
    `);
    
    const totalEntrada = result?.total_entrada ?? 0;
    const totalSaida = result?.total_saida ?? 0;

    return {
        totalEntrada,
        totalSaida,
        balance: totalEntrada - totalSaida
    };
};

// --- FUNÇÕES DE GRÁFICOS (NOVO) ---

// Modelo do resultado que virá do SQL
interface MonthlyData {
  month: string; // Formato YYYY-MM
  total: number;
}

// 1. Gráfico de Ganhos Mensais (Apenas serviços CONCLUÍDOS)
export const getMonthlyRevenue = async (): Promise<MonthlyData[]> => {
    const db = await getDb();
    
    // SQL para AGREGAR dados: extrai Ano e Mês da coluna 'date' e soma o valor
    const data = await db.getAllAsync<MonthlyData>(`
        SELECT
            strftime('%Y-%m', date) as month,
            SUM(value) as total
        FROM
            services
        WHERE
            isCompleted = 1 -- Apenas serviços faturados
        GROUP BY
            month
        ORDER BY
            month DESC
        LIMIT 6; -- Últimos 6 meses
    `);
    
    // O Expo SQLite não tem o total_entrada / total_saida de forma simples em uma query.
    // Vamos usar a mesma lógica do getFinanceBalance() mas agrupando por mês no Javascript
    return data;
};