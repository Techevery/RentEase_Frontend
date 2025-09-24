export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmarks?: string[];
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
  hasWifi?: boolean;
  amenities: string[];
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
  floorType: string;
  ceilingHeight: number;
  windowType: string;
  amenities: string[];
}

export interface House {
  id: string;
  managerId?: string | null;
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;

  } | null; // Manager can be null if not assigned
  name: string;
  address: string;
  description: string;
  propertyType: 'residential' | 'commercial';
  totalFlats: number;
  amenities: string[];
  maintenanceContact: string;
  parkingSpaces: number;
  commonAreas: string[];
  emergencyContact: string;
  features: HouseFeatures;
  location: PropertyLocation;
  status: 'active' | 'inactive' | 'maintenance';
  images?: Array<{ url: string; isPrimary: boolean }>;
  data: {
    houses: House[];
    flats: Flat[];
  };
}

export interface Unit {
  id: string;
  tenantId:string;
  onView: () => void;
  houseId: string;
  name: string;
  size:number;
  number: string;
  description: string;
  floorNumber: number;
  bedrooms: number;
  bathrooms:number;
  furnished:boolean;
  palour: boolean;
  toilet: number;
  kitchen: boolean;
  rentAmount: number;
  depositAmount: number;
  rentDueDay: number;
  utilities: string[];
  features: UnitFeatures;
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
 images?: Array<{ url: string; isPrimary: boolean}>;
}

export interface PropertyFormData {
  name: string;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  }
  address: string;
  description: string;
  propertyType: 'residential' | 'commercial';
  totalFlats: number;
  amenities: string[];
  parkingSpaces: number;
  commonAreas: string[];
  emergencyContact: string ;
  features: HouseFeatures;
  location: PropertyLocation;
  maintenanceContact:string;
  images: any[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface UnitFormData {
 
  houseId: string;
  tenantId:string;
  name: string;
  size:number;
  number: string;
  description: string;
  floorNumber: number;
  bedrooms: number;
  palour: boolean;
  toilet: number;
  images: any[];
  bathrooms:number;
  furnished:boolean;
  kitchen: boolean;
  rentAmount: number;
  depositAmount: number;
  rentDueDay: number;
  utilities: string[]; 
  features: UnitFeatures;
  status: 'vacant' | 'occupied';
}

export interface Image {
  url: string;
  isPrimary: boolean;
}

  



// Complete Manager interface with all necessary fields
export interface Manager {

  data: {
  houses: House[];
  
};
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department?: string;
  role: 'property_manager' | 'assistant_manager' | 'maintenance_manager' | 'leasing_manager';
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  permissions: ManagerPermissions;
  assignedProperties: string[]; // Array of property IDs
  workSchedule?: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
  salary?: {
    amount: number;
    currency: string;
    payFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  };
  createdAt: string;
  updatedAt: string;
}


// Manager permissions interface
export interface ManagerPermissions {
  canCreateProperties: boolean;
  canEditProperties: boolean;
  canDeleteProperties: boolean;
  canManageUnits: boolean;
  canManageTenants: boolean;
  canCollectRent: boolean;
  canScheduleMaintenance: boolean;
  canViewReports: boolean;
  canManageDocuments: boolean;
  canAccessFinancials: boolean;
}

// Work schedule interface
export interface WorkDay {
  isWorkDay: boolean;
  startTime?: string; // Format: "HH:MM"
  endTime?: string;   // Format: "HH:MM"
  breakTime?: {
    start: string;
    end: string;
  };
}

// Manager statistics interface
export interface ManagerStats {
  managerId: string;
  totalProperties: number;
  totalUnits: number;
  totalFlats: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceRequests: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  rentCollection: {
    collected: number;
    pending: number;
    overdue: number;
  };
  tenantSatisfactionScore?: number;
  averageResponseTime?: number; // in hours
}

// Manager activity log interface
export interface ManagerActivity {
  id: string;
  managerId: string;
  action: string;
  description: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  timestamp: string;
  // metadata?: Record<string, any>;
}

// Manager form data for creating/updating managers
export interface ManagerFormData {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department?: string;
  role: 'property_manager' | 'assistant_manager' | 'maintenance_manager' | 'leasing_manager';
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  permissions: ManagerPermissions;
  assignedProperties: string[];
  workSchedule?: {
    monday: WorkDay;
    tuesday: WorkDay;
    wednesday: WorkDay;
    thursday: WorkDay;
    friday: WorkDay;
    saturday: WorkDay;
    sunday: WorkDay;
  };
  salary?: {
    amount: number;
    currency: string;
    payFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  };
}