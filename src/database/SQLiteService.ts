import * as SQLite from 'expo-sqlite';
import { ServiceModel } from './types';

// Garante que estamos usando o mesmo banco novo
const getDb = async () => {
  return await SQLite.openDatabaseAsync('oficina_v2.db');
};

export const addService = async (service: ServiceModel) => {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO services (description, value, date, location, isCompleted) VALUES (?, ?, ?, ?, ?)',
    [
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