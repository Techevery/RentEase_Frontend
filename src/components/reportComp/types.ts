export interface PropertyPerformanceItem {
  property: {
    id: string;
    name: string;
    address: string;
    totalFlats: number;
    occupiedFlats: number;
    occupancyRate: number;
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
  counts: {
    payments: number;
    expenses: number;
  };
}

export interface PropertyPerformanceResponse {
  data: PropertyPerformanceItem[];
  summary: {
    totalProperties: number;
    averageOccupancyRate: number;
    totalRevenueAcrossProperties: number;
    totalExpensesAcrossProperties: number;
    totalNetIncomeAcrossProperties: number;
  };
}

export interface FinancialSummary {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
  };
  counts: {
    totalPayments: number;
    totalExpenses: number;
  };
  monthlyBreakdown: {
    revenue: Record<string, number>;
    expenses: Record<string, number>;
  };
  timeframe: {
    from: string;
    to: string;
  };
}

export interface Tenant {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  status: string;
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
  unit: {
    id: string;
    number: string;
  } | null;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentDate: string;
  dueDate: string;
  paymentMethod: string;
  description: string;
  reference: string;
  receiptUrl?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  flat: string;
  property: string;
  uploadedBy: string;
  createdAt: string;
}

export interface PaymentSummary {
  tenant: Tenant;
  summary: {
    totalPayments: number;
    totalAmount: number;
    approved: {
      count: number;
      amount: number;
    };
    pending: {
      count: number;
      amount: number;
    };
    rejected: {
      count: number;
      amount: number;
    };
    averagePayment: number;
  };
  allPayments: Payment[];
}
export interface ExpenseCategoryBreakdown {
  [category: string]: {
    count: number;
    totalAmount: number;
    averageAmount: number;
    percentage: number;
    expenses: any[];
  };
}

export interface MonthlyExpenseBreakdown {
  [monthYear: string]: {
    totalAmount: number;
    count: number;
    byCategory: Record<string, number>;
  };
}

export interface PropertyExpenseBreakdown {
  [propertyId: string]: {
    name: string;
    totalAmount: number;
    count: number;
    byCategory: Record<string, number>;
  };
}

export interface ExpensesBreakdownResponse {
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
  };
  categoryBreakdown: ExpenseCategoryBreakdown;
  monthlyBreakdown: MonthlyExpenseBreakdown;
  propertyBreakdown: PropertyExpenseBreakdown;
  topExpenses: any[];
  allExpenses: any[];
  filters?: {
    fromDate?: string;
    toDate?: string;
    propertyId?: string;
  };
  warnings?: string;
}