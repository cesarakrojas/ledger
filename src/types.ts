export interface Transaction {
  id: string;
  type: 'inflow' | 'outflow';
  description: string;
  category?: string;
  paymentMethod?: string;
  amount: number;
  timestamp: string;
}

export interface CategoryConfig {
  enabled: boolean;
  inflowCategories: string[];
  outflowCategories: string[];
}

export interface PaymentMethodsConfig {
  methods: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  /** Stock quantity for the product */
  quantity: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Reusable product quantity map used by inflow/purchase forms
export interface ProductQuantity {
  [productId: string]: number;
}

export interface InventoryFilters {
  searchTerm?: string;
  category?: string;
  lowStock?: boolean;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  transactionId: string;
}

export interface DebtEntry {
  id: string;
  type: 'receivable' | 'payable'; // cobro pendiente | pago pendiente
  counterparty: string; // client name or supplier name
  amount: number; // current remaining balance
  originalAmount: number; // the original debt amount
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
  linkedTransactionId?: string; // links to Transaction.id when fully paid
  category?: string;
  notes?: string;
  payments?: DebtPayment[]; // history of partial payments
}

export interface Contact {
  id: string;
  type: 'client' | 'supplier';
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
