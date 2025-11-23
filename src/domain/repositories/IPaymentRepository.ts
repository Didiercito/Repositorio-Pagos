export interface CreatePaymentDTO {
  amount: number;    
  currency: string;  
  userId: string;      
  userEmail: string;   
  userName: string;    
  description?: string;
  successUrl: string;  
  cancelUrl: string;    
}

export interface IPaymentRepository {
  getBalance(): Promise<Balance>;


  getTransactionHistory(options: {
    limit: number;
    starting_after?: string;
  }): Promise<Transaction[]>;

  createCheckoutSession(data: CreatePaymentDTO): Promise<{ url: string }>;
}

export interface Balance {
  available: number;
  pending: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  type: string;
  status: string;
  created: Date;
}