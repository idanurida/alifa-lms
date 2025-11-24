// types/keuangan.ts

// Bukti Transfer
export interface PaymentEvidence {
  id: number;
  student_id: number;
  student: {
    name: string;
    nim: string;
  }; // Embedded student info
  academic_period_id: number;
  academic_period: {
    name: string;
    code: string;
  }; // Embedded period info
  amount: number;
  evidence_path: string;
  transfer_date: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

// Invoice
export interface Invoice {
  id: number;
  student_id: number;
  academic_period_id: number;
  amount: number;
  due_date: string;
  status: 'unpaid' | 'paid' | 'overdue';
  created_at: string;
}