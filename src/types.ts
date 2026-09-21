export type IncomeType = 'fixa' | 'variavel';

export type BillRecurrenceType = 
  | 'recorrente_fixo'      // Valor fixo e recorrente (ex: Escola, Aluguel, Academia)
  | 'recorrente_variavel'  // Recorrente com valor que varia (ex: Luz, Água, Gás, Cartão)
  | 'parcelado'            // Parcelas de compra/crediário (ex: 3/10)
  | 'unico';               // Gasto pontual do mês

export type BillStatus = 'pendente' | 'pago' | 'em_divida';

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  avatarLetter: string;
  role?: string;
}

export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: IncomeType;
  monthYear: string; // 'YYYY-MM', e.g. '2026-08'
  received: boolean;
  receiveDay?: number;
}

export interface Bill {
  id: string;
  userId: string;
  description: string;
  amount: number;
  dueDay: number;
  monthYear: string; // 'YYYY-MM' (mês a que se refere ou foi gerado)
  category: string;
  recurrenceType: BillRecurrenceType;
  installmentInfo?: {
    current: number;
    total: number;
  };
  status: BillStatus;
  paidDate?: string;
  notes?: string;
  carriedFromMonth?: string; // se for boleto não pago em mês anterior
}

export type DebtStatus = 'pendente_contato' | 'em_negociacao' | 'acordo_fechado' | 'quitado';
export type DebtPriority = 'alta' | 'media' | 'baixa';

export interface Debt {
  id: string;
  userId: string;
  creditor: string;
  description: string;
  originalAmount: number;
  currentAmount: number;
  negotiatedAmount?: number;
  initialDueDate: string; // 'YYYY-MM-DD' ou 'YYYY-MM'
  status: DebtStatus;
  priority: DebtPriority;
  contactInfo?: string;
  notes?: string;
  installmentsPlan?: {
    totalInstallments: number;
    paidInstallments: number;
    installmentAmount: number;
  };
}

export type WishPriority = 'urgente' | 'essencial' | 'desejo' | 'planejado';
export type WishStatus = 'planejado' | 'comprado' | 'descartado';

export interface WishlistItem {
  id: string;
  userId: string;
  title: string;
  estimatedPrice: number;
  category: string;
  priority: WishPriority;
  status: WishStatus;
  targetMonth?: string;
  linkOrNotes?: string;
  createdDate: string;
}

export type ActiveTab = 'mensal' | 'dividas' | 'compras';
