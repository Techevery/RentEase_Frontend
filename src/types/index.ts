

export interface User {
  id: string;
  phonenumber: string;
  name: string;
  email: string;
  role: 'landlord' | 'manager';
  createdAt: string;
  updatedAt: string;
}

export interface House {
  _id: string;
  flats: never[];
  id: string;
  name: string;
  address: string;
  description?: string;
  propertyType: 'residential' | 'commercial';
  totalFlats: number;
  amenities: string[];
  parkingSpaces?: number;
  commonAreas?: string[];
  maintenanceContact?: string;
  emergencyContact: string;
  landlordId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  Propertyimages: File[];
  images?: Array<{ url: string; isPrimary: boolean }>;
  publicId: string[];
}


export interface PropertyImage {
  id: string;
  images: File[];
  
}



export interface Flat {
  id: string;
  images: File[];
  number: string;
  houseId: string;
  managerId?: string;
  tenantId?: string;
  floorNumber: number;
  size: number;
  description: string;
  palour: boolean;
  toilet: number;
  kitchen: boolean;
  Propertyimages: string[];
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  rentAmount: number;
  depositAmount: number;
  rentDueDay: number;
  utilities: string[];
  status: 'vacant' | 'occupied' | 'maintenance';
  maintenanceHistory: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  date: string;
  description: string;
  cost: number;
}

// export interface Tenant {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   houseId?:string;
//   emergencyContact?: string;
//   maintenanceContact?: string;
//   flatId?:string;
//   landlordId: string;
//   leaseStartDate: string;
//   leaseEndDate: string;
//   createdAt: string;
// }


export interface TenantReference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  description: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'other';
  period?: {
    from: string;
    to: string;
  };
  tenantId: string;
  unitId: string;
  houseId: string;
  managerId: string;
  landlordId: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Expense {
  id: string;
  amount: number;
  vendor: string;
  expenseDate: string;
  category: 'maintenance' | 'utilities' | 'taxes' | 'insurance' | 'other';
  description: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  houseId: string;
  flatId?: string;
  managerId: string;
  landlordId: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  recipientId: string;
  recipientRole: string;
  referenceId?: string;
  referenceModel?: string;
  createdAt: string;
}


export interface Manager extends User {
    id: string;
  specializations: string[];
  yearsOfExperience: number;
  maxProperties: number;
  status: 'active' | 'inactive';
  assignedDate: string;
  lastActive: string;
  properties: {
    houses: string[];
    flats: string[];
  };
}

export interface DashboardStats {
  propertyCounts: {
    houses: number;
    flats: number;
    tenants: number;
    managers: number;
    occupancyRate: number;
  };
  financials: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    pendingPayments: number;
    overduePayments: number;
  };
  maintenance: {
    pending: number;
    inProgress: number;
    completed: number;
    urgentIssues: number;
  };
  recentActivity: {
    payments: Payment[];
    expenses: Expense[];
    maintenance: MaintenanceRecord[];
    notifications: Notification[];
  };
  periodComparison: {
    income: {
      current: number;
      previous: number;
      change: number;
    };
    expenses: {
      current: number;
      previous: number;
      change: number;
    };
    occupancy: {
      current: number;
      previous: number;
      change: number;
    };
  };
}

export interface Report {
  id: string;
  type: 'payment' | 'expense' | 'occupancy' | 'maintenance' | 'manager_performance';
  period: {
    from: string;
    to: string;
  };
  data:string;
  filters?:string;
  generatedBy: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'excel';
  url?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}


export type NotificationType = 
  | 'payment_due'
  | 'payment_received'
  | 'payment_approved'
  | 'payment_rejected'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'maintenance_scheduled'
  | 'maintenance_completed'
  | 'lease_expiring'
  | 'tenant_added'
  | 'tenant_removed'
  | 'manager_assigned'
  | 'manager_removed'
  | 'inspection_due';



  export interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  isPrimary: boolean;
  type: 'exterior' | 'interior' | 'amenity' | 'document';
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  format: string;
  width: number;
  height: number;
}

export interface PropertyDocument {
  id: string;
  title: string;
  type: 'contract' | 'insurance' | 'permit' | 'certificate' | 'other';
  url: string;
  publicId: string;
  uploadedAt: string;
  uploadedBy: string;
  expiryDate?: string;
  tags: string[];
  size: number;
  format: string;
}

export interface House {
  id: string;
  name: string;
  address: string;
  description?: string;
  propertyType: 'residential' | 'commercial';
  totalUnits: number;
  amenities: string[];
  parkingSpaces?: number;
  commonAreas?: string[];
  maintenanceContact?: string;
  emergencyContact: string;
  images?: Array<{ url: string; isPrimary: boolean }>;
  documents: PropertyDocument[];
  landlordId: string;
  managerId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  occupancyRate: number;
  features: HouseFeatures;
  location: PropertyLocation;
  insurance?: InsuranceDetails;
  createdAt: string;
  updatedAt: string;
}

export interface HouseFeatures {
  hasElevator: boolean;
  hasGenerator: boolean;
  hasSecurity: boolean;
  hasGym: boolean;
  hasPool: boolean;
  hasPlayground: boolean;
  hasGarden: boolean;
  hasCCTV: boolean;
  hasVisitorParking: boolean;
  hasWaterTreatment: boolean;
  amenities: string[];
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  landmarks?: string[];
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage: string;
  startDate: string;
  endDate: string;
  premium: number;
  documents: PropertyDocument[];
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  number: string;
  houseId: string;
  managerId?: string;
  tenantId?: string;
  floorNumber: number;
  bedrooms: number;
  palour: boolean;
  toilet: number;
  kitchen: boolean;
  images: PropertyImage[];
  documents: PropertyDocument[];
  rentAmount: number;
  depositAmount: number;
  rentDueDay: number;
  utilities: string[];
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  maintenanceHistory: MaintenanceRecord[];
  features: UnitFeatures;
  inspection: InspectionDetails;
  createdAt: string;
  updatedAt: string;
}

export interface UnitFeatures {
  hasBalcony: boolean;
  hasParkingSpace: boolean;
  hasStorage: boolean;
  hasSecuritySystem: boolean;
  hasIntercom: boolean;
  furnishingStatus: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  airConditioned: boolean;
  orientation: 'north' | 'south' | 'east' | 'west';
  view?: string;
  floorType: string;
  ceilingHeight: number;
  windowType: string;
  amenities: string[];
}

export interface InspectionDetails {
  lastInspection?: {
    date: string;
    inspector: string;
    report: string;
    status: 'passed' | 'failed' | 'pending';
    issues: string[];
    images: PropertyImage[];
  };
  nextInspectionDue: string;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  type: 'routine' | 'emergency' | 'improvement' | 'repair';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedAt?: string;
  warranty?: {
    provider: string;
    expiryDate: string;
    terms: string;
  };
  parts?: {
    name: string;
    cost: number;
    quantity: number;
  }[];
  images: PropertyImage[];
  documents: PropertyDocument[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}








export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  role: 'landlord' | 'manager';
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  isPrimary: boolean;
  type: 'exterior' | 'interior' | 'amenity' | 'document';
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  format: string;
  width: number;
  height: number;
}

export interface PropertyDocument {
  id: string;
  title: string;
  type: 'contract' | 'insurance' | 'permit' | 'certificate' | 'other';
  url: string;
  publicId: string;
  uploadedAt: string;
  uploadedBy: string;
  expiryDate?: string;
  tags: string[];
  size: number;
  format: string;
}

export interface HouseFeatures {
  hasElevator: boolean;
  hasGenerator: boolean;
  hasSecurity: boolean;
  hasGym: boolean;
  hasPool: boolean;
  hasPlayground: boolean;
  hasGarden: boolean;
  hasCCTV: boolean;
  hasVisitorParking: boolean;
  hasWaterTreatment: boolean;
  amenities: string[];
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  landmarks?: string[];
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage: string;
  startDate: string;
  endDate: string;
  premium: number;
  documents: PropertyDocument[];
}

export interface House {
  id: string;
  name: string;
  address: string;
  description?: string;
  propertyType: 'residential' | 'commercial';
  totalUnits: number;
  amenities: string[];
  parkingSpaces?: number;
  commonAreas?: string[];
  maintenanceContact?: string;
  emergencyContact: string;
 images?: Array<{ url: string; isPrimary: boolean }>;
  documents: PropertyDocument[];
  landlordId: string;
  managerId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  occupancyRate: number;
  features: HouseFeatures;
  location: PropertyLocation;
  insurance?: InsuranceDetails;
  createdAt: string;
  updatedAt: string;
  Propertyimages: File[];

}

export interface UnitFeatures {
  hasBalcony: boolean;
  hasParkingSpace: boolean;
  hasStorage: boolean;
  hasSecuritySystem: boolean;
  hasIntercom: boolean;
  furnishingStatus: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  airConditioned: boolean;
  orientation: 'north' | 'south' | 'east' | 'west';
  view?: string;
  floorType: string;
  ceilingHeight: number;
  windowType: string;
  amenities: string[];
}

export interface InspectionDetails {
  lastInspection?: {
    date: string;
    inspector: string;
    report: string;
    status: 'passed' | 'failed' | 'pending';
    issues: string[];
    images: PropertyImage[];
  };
  nextInspectionDue: string;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  cost: number;
  type: 'routine' | 'emergency' | 'improvement' | 'repair';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedAt?: string;
  warranty?: {
    provider: string;
    expiryDate: string;
    terms: string;
  };
  parts?: {
    name: string;
    cost: number;
    quantity: number;
  }[];
  images: PropertyImage[];
  documents: PropertyDocument[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  number: string;
  houseId: string;
  managerId?: string;
  tenantId?: string;
  floorNumber: number;
  bedrooms: number;
  palour: boolean;
  toilet: number;
  kitchen: boolean;
  images: PropertyImage[];
  documents: PropertyDocument[];
  rentAmount: number;
  depositAmount: number;
  rentDueDay: number;
  utilities: string[];
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  maintenanceHistory: MaintenanceRecord[];
  features: UnitFeatures;
  inspection: InspectionDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  tenants: string;
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  property: string | {
    _id: string;
    name: string;
    address?: string;
  };
  propertyAddress?: string;
  unit: string | {
    _id: string;
    name: string;
    number: string;
  };
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: number;
  cautionFee?: number;
  serviceCharge?: number;
  totalRent?: number;
  status: 'active' | 'inactive';
  lastPayment?: string | Date | null;
  lastPaymentAmount?: number;
  lastPaymentStatus?: string;
  nextPayment?: string | Date | null;
  paymentStatus: 'current' | 'late' | 'pending' | 'none';
  emergencyContact?: string;
  createdAt?: string | Date;
  flat?: {
    _id: string;
    number: string;
    houseId?: {
      _id: string;
      name: string;
      address: string;
    };
  };
  landlordId?: string;
  managerId?: string;
  userId?: string;
  
  // New fields based on TenantProfileModal usage
  emergencyContactName?: string;
  emergencyContactAddress?: string;
  maritalStatus?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  currentAddress?: string;
  yearsAtCurrentAddress?: number;
  monthsAtCurrentAddress?: number;
  reasonForLeaving?: string;
  occupation?: string;
  position?: string;
  spouseName?: string;
  agencyFee?: number;
  legalFee?: number;
}

export interface Payment {
  id: string;
  // Updated
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online';
  description: string;
  receiptUrl?: string;
  receiptPublicId?: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'other';
  period?: {
    from: string;
    to: string;
  };
  tenantId: string 
  houseId: string ; 
  unitId: string 
  managerId: string;
  landlordId: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
}

export interface Expense {
  id: string;
  amount: number;
  expenseDate: string;
  category: 'maintenance' | 'utilities' | 'taxes' | 'insurance' | 'other';
  description: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  houseId: string;
  flatId?: string;
  managerId: string;
  landlordId: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}



export interface Manager extends User {
  specializations: string[];
  yearsOfExperience: number;
  maxProperties: number;
  status: 'active' | 'inactive';
  assignedDate: string;
  lastActive: string;
  properties: {
    houses: string[];
    flats: string[];
  };
}

// ===== LANDLORD-SPECIFIC TYPES =====

export interface Landlord extends User {
  role: 'landlord';
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
  licenseNumber?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    routingNumber?: string;
  };
  preferences?: {
    currency: string;
    timezone: string;
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  subscription?: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'trial' | 'expired';
    startDate: string;
    endDate: string;
    features: string[];
  };
  stats?: {
    totalProperties: number;
    totalUnits: number;
    totalManagers: number;
    totalTenants: number;
    totalRevenue: number;
    occupancyRate: number;
  };
}

export interface LandlordManager {
  id: string;
  name: string;
  email: string;
  phonenumber: string;
  role: 'manager';
  landlordId: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: ManagerPermissions;
  assignedProperties: string[];
  performance?: ManagerPerformance;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  invitedAt: string;
  activatedAt?: string;
}

export interface ManagerPermissions {
  canManageProperties: boolean;
  canManageTenants: boolean;
  canManagePayments: boolean;
  canManageExpenses: boolean;
  canManageMaintenance: boolean;
  canViewReports: boolean;
  canManageDocuments: boolean;
  maxProperties?: number;
  restrictedActions?: string[];
}

export interface ManagerPerformance {
  totalPropertiesManaged: number;
  totalTenantsManaged: number;
  averageOccupancyRate: number;
  totalRevenueManaged: number;
  maintenanceResponseTime: number;
  tenantSatisfactionScore: number;
  paymentCollectionRate: number;
  lastPerformanceReview?: string;
  performanceNotes?: string;
}

export interface DashboardStats {
  overview: {
    totalProperties: number;
    totalUnits: number;
    totalManagers: number;
    totalTenants: number;
    occupancyRate: number;
    vacancyRate: number;
  };
  financial: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalExpenses: number;
    monthlyExpenses: number;
    netIncome: number;
    monthlyNetIncome: number;
    pendingPayments: number;
    overduePayments: number;
    collectionRate: number;
    incomeCollectedPercent: number;
  };
  operational: {
    maintenanceRequests: {
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
    };
    inspectionsDue: number;
    leaseExpirations: {
      thisMonth: number;
      nextMonth: number;
      next3Months: number;
    };
    documentsExpiring: number;
  };
  performance: {
    averageOccupancyRate: number;
    averageRentCollection: number;
    averageMaintenanceTime: number;
    tenantRetentionRate: number;
    propertyAppreciationRate: number;
  };
  recentActivity: {
    payments: Payment[];
    expenses: Expense[];
    maintenance: MaintenanceRecord[];
    notifications: Notification[];
  };
  trends: {
    revenueGrowth: number;
    occupancyTrend: number;
    expenseGrowth: number;
    tenantGrowth: number;
  };
}

export interface LandlordActivity {
  id: string;
  type: 'property' | 'tenant' | 'payment' | 'maintenance' | 'manager' | 'expense' | 'document';
  action: string;
  description: string;
  entityId?: string;
  entityType?: string;
  performedBy: {
    id: string;
    name: string;
    role: 'landlord' | 'manager';
  };
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'completed' | 'failed';
}

export interface LandlordReport {
  id: string;
  title: string;
  type: 'financial' | 'occupancy' | 'maintenance' | 'performance' | 'tax' | 'custom';
  period: {
    from: string;
    to: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  filters: {
    properties?: string[];
    managers?: string[];
    tenants?: string[];
    categories?: string[];
  };

  summary: {
    totalRecords: number;
    totalAmount?: number;
    averageAmount?: number;
    keyMetrics: Record<string, number>;
  };
  generatedBy: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  status: 'generating' | 'completed' | 'failed' | 'expired';
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
}

export interface LandlordNotification extends Notification {
  category: 'system' | 'payment' | 'maintenance' | 'tenant' | 'manager' | 'property' | 'financial';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  relatedEntities?: {
    type: string;
    id: string;
    name: string;
  }[];
  scheduledFor?: string;
  expiresAt?: string;
}

export interface LandlordSettings {
  id: string;
  landlordId: string;
  general: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    website?: string;
    logo?: string;
    timezone: string;
    currency: string;
    language: string;
  };
  financial: {
    defaultLateFee: number;
    defaultSecurityDeposit: number;
    paymentMethods: string[];
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      routingNumber?: string;
    };
    taxSettings: {
      taxId: string;
      taxRate: number;
      includeInRent: boolean;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      paymentReminders: boolean;
      maintenanceAlerts: boolean;
      leaseExpirations: boolean;
      managerUpdates: boolean;
    };
    sms: {
      enabled: boolean;
      urgentOnly: boolean;
      paymentOverdue: boolean;
      emergencyMaintenance: boolean;
    };
    push: {
      enabled: boolean;
      allActivities: boolean;
      importantOnly: boolean;
    };
  };
  automation: {
    paymentReminders: {
      enabled: boolean;
      daysBefore: number[];
      escalation: boolean;
    };
    leaseRenewal: {
      enabled: boolean;
      daysBefore: number;
      autoGenerate: boolean;
    };
    maintenanceScheduling: {
      enabled: boolean;
      autoAssign: boolean;
      priorityRules: string[];
    };
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
    auditLog: boolean;
  };
  integrations: {
    accounting: {
      enabled: boolean;
      provider?: string;
      settings?:string[];
    };
    payment: {
      enabled: boolean;
      providers: string[];
      settings?: string;
    };
    communication: {
      enabled: boolean;
      emailProvider?: string;
      smsProvider?: string;
      settings?:string[];
    };
  };
  updatedAt: string;
}


// Add this to your types/index.ts file

export interface ManagerDashboardStats {
  propertyCounts: {
    houses: number;
    flats: number;
    tenants: number;
  };
  paymentStats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  expenseStats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  recentActivity: {
    payments: Array<{
      id: string;
      amount: number;
      status: 'pending' | 'approved' | 'rejected';
      paymentDate?: string;
      dueDate?: string;
      description?: string;
      tenantId?: string | { name: string };
      flatId?: string | { number: string };
      houseId?: string | { name: string };
    }>;
    expenses: Array<{
      id: string;
      amount: number;
      status: 'pending' | 'approved' | 'rejected';
      expenseDate?: string;
      description?: string;
      flatId?: string | { number: string };
      houseId?: string | { name: string };
    }>;
  };
}


// ===== API REQUEST/RESPONSE TYPES =====

export interface CreateManagerRequest {
  name: string;
  email: string;
  phone: string;
  permissions?: Partial<ManagerPermissions>;
  assignedProperties?: string[];
}

export interface UpdateManagerRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  permissions?: Partial<ManagerPermissions>;
  assignedProperties?: string[];
}

export interface ManagerInviteResponse {
  success: boolean;
  data: LandlordManager;
  message: string;
  inviteToken?: string;
}

export interface LandlordApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
}

export interface LandlordApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?:string[];
  };
  timestamp: string;
}

// ===== FORM TYPES =====

export interface ManagerFormData {
  name: string;
  email: string;
  phone: string;
  permissions?: Partial<ManagerPermissions>;
  assignedProperties?: string[];
}

export interface LandlordProfileFormData {
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
}



export type LandlordRole = 'landlord';
export type ManagerRole = 'manager';
export type UserRole = LandlordRole | ManagerRole;

export type PropertyStatus = 'active' | 'inactive' | 'maintenance';
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'reserved';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// export type NotificationType = 
//   | 'payment_due'
//   | 'payment_received'
//   | 'payment_approved'
//   | 'payment_rejected'
//   | 'expense_submitted'
//   | 'expense_approved'
//   | 'expense_rejected'
//   | 'maintenance_scheduled'
//   | 'maintenance_completed'
//   | 'lease_expiring'
//   | 'tenant_added'
//   | 'tenant_removed'
//   | 'manager_assigned'
//   | 'manager_removed'
//   | 'inspection_due'
//   | 'document_expiring'
//   | 'system_update'
//   | 'security_alert';

export type ReportType = 
  | 'financial'
  | 'occupancy'
  | 'maintenance'
  | 'performance'
  | 'tax'
  | 'custom';

export type ActivityType = 
  | 'property'
  | 'tenant'
  | 'payment'
  | 'maintenance'
  | 'manager'
  | 'expense'
  | 'document'
  | 'system';

// ===== LEGACY COMPATIBILITY =====
// Keep these for backward compatibility with existing code

// export interface DashboardStats extends LandlordDashboardStats {}

// export interface TenantReference {
//   name: string;
//   relationship: string;
//   phone: string;
//   email: string;
//   verified: boolean;
//   verifiedAt?: string;
// }

// export interface Report extends LandlordReport {}