// Aqui definimos a "cara" do nosso objeto Serviço
export interface ServiceModel {
  id?: number;          // O ID é opcional na criação (o banco cria sozinho), mas obrigatório na leitura
  description: string;  // Ex: "Troca de fiação"
  value: number;        // Ex: 150.00
  date: string;         // Vamos salvar como texto ISO: "2023-10-25"
  location: string;     // Ex: "Rua das Flores, 123"
  isCompleted: number;  // SQLite não tem booleano (true/false), usamos 0 (falso) ou 1 (verdadeiro)
}