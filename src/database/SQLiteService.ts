import * as SQLite from 'expo-sqlite';
import { ServiceModel, ServiceTypeModel, FinanceModel } from './types';

// Garante que estamos usando o mesmo banco novo
const getDb = async () => {
  // MUDANÇA CRÍTICA: Novo nome do banco
  return await SQLite.openDatabaseAsync('oficina_v3.db'); 
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
// --- NOVA LÓGICA FINANCEIRA PROFISSIONAL ---

// 1. Adicionar APENAS Saída (Gasto) na tabela finance
export const addExpense = async (description: string, value: number, date: string, category: string) => {
    const db = await getDb();
    await db.runAsync(
        'INSERT INTO finance (type, description, value, date) VALUES (?, ?, ?, ?)',
        ['saida', description, value, date] // Forçamos 'saida'
    );
};

// 2. Buscar Extrato Unificado (Serviços + Gastos)
export interface Transaction {
    id: string; // ID único combinado (ex: 's-1' ou 'f-5')
    type: 'entrada' | 'saida';
    description: string;
    value: number;
    date: string;
    origin: 'service' | 'finance'; // Para sabermos de onde veio
}

export const getUnifiedTransactions = async () => {
    const db = await getDb();
    
    // A. Busca Serviços CONCLUÍDOS (Entradas)
    const services = await db.getAllAsync<any>('SELECT id, description, value, date FROM services WHERE isCompleted = 1');
    
    // B. Busca Gastos manuais (Saídas) da tabela finance
    const expenses = await db.getAllAsync<any>("SELECT id, description, value, date FROM finance WHERE type = 'saida'");

    // C. Unifica e Padroniza
    const unified: Transaction[] = [
        ...services.map(s => ({
            id: `s-${s.id}`,
            type: 'entrada' as const,
            description: s.description,
            value: s.value,
            date: s.date,
            origin: 'service' as const
        })),
        ...expenses.map(e => ({
            id: `f-${e.id}`,
            type: 'saida' as const,
            description: e.description,
            value: e.value,
            date: e.date,
            origin: 'finance' as const
        }))
    ];

    // D. Ordena por Data (Mais recente primeiro)
    return unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 3. Excluir Transação (Se for serviço, avisa que deve excluir lá)
export const deleteTransaction = async (id: string, origin: 'service' | 'finance') => {
    const db = await getDb();
    const realId = id.split('-')[1]; // Remove o prefixo

    if (origin === 'service') {
        // Opção: Deletar o serviço ou apenas voltar para pendente. 
        // Vamos deletar por enquanto para simplificar o fluxo de caixa.
        await db.runAsync('DELETE FROM services WHERE id = ?', [realId]);
    } else {
        await db.runAsync('DELETE FROM finance WHERE id = ?', [realId]);
    }
};