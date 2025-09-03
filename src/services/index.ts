export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'landlord' | 'manager';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Property {
    _id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    landlord: string | User;
    manager?: string | User;
    units: Array<{
      number: string;
      type: string;
      bedrooms: number;
      bathrooms: number;
      rentAmount: number;
      status: 'vacant' | 'occupied' | 'maintenance';
      currentTenant?: string | User;
    }>;
    amenities: string[];
    images: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Payment {
    _id: string;
    tenant: string | User;
    property: string | Property;
    unit: string;
    amount: number;
    paymentDate: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
    reference: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Expense {
    _id: string;
    property: string | Property;
    category: string;
    amount: number;
    date: string;
    description: string;
    vendor: string;
    receipt?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string | User;
    createdBy: string | User;
    createdAt: string;
    updatedAt: string;
  }