// Modelo para cada Serviço (Trabalho)
export interface ServiceModel {
  id?: number;
  serviceTypeId: number; // AGORA É OBRIGATÓRIO NA HORA DE SALVAR
  description: string;
  value: number;
  date: string;
  location: string;
  isCompleted: number; // 0=Pendente, 1=Concluído
}

// Modelo para o Catálogo de Serviços
export interface ServiceTypeModel {
    id: number;
    name: string; // Ex: "Elétrica"
}

// Modelo para o Controle de Caixa (Entrada/Saída)
export interface FinanceModel {
    id?: number;
    type: 'entrada' | 'saida';
    description: string;
    value: number;
    date: string;
}