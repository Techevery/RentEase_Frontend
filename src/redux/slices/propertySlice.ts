import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { House, Unit, PropertyImage, MaintenanceRecord, PropertyDocument } from '../../types';

interface PropertyState {
  houses: House[];
  selectedHouse: House | null;
  units: Unit[];
  selectedUnit: Unit | null;
  loading: boolean;
  error: string | null;
  imageUploading: boolean;
  imageUploadError: string | null;
  maintenanceLoading: boolean;
  maintenanceError: string | null;
  documentUploading: boolean;
  documentUploadError: string | null;
}

const initialState: PropertyState = {
  houses: [],
  selectedHouse: null,
  units: [],
  selectedUnit: null,
  loading: false,
  error: null,
  imageUploading: false,
  imageUploadError: null,
  maintenanceLoading: false,
  maintenanceError: null,
  documentUploading: false,
  documentUploadError: null,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setHouses: (state, action: PayloadAction<House[]>) => {
      state.houses = action.payload;
    },
    setSelectedHouse: (state, action: PayloadAction<House | null>) => {
      state.selectedHouse = action.payload;
    },
    setUnits: (state, action: PayloadAction<Unit[]>) => {
      state.units = action.payload;
    },
    setSelectedUnit: (state, action: PayloadAction<Unit | null>) => {
      state.selectedUnit = action.payload;
    },
    addHouse: (state, action: PayloadAction<House>) => {
      state.houses.push(action.payload);
    },
    updateHouse: (state, action: PayloadAction<House>) => {
      const index = state.houses.findIndex(house => house.id === action.payload.id);
      if (index !== -1) {
        state.houses[index] = action.payload;
        if (state.selectedHouse?.id === action.payload.id) {
          state.selectedHouse = action.payload;
        }
      }
    },
    removeHouse: (state, action: PayloadAction<string>) => {
      state.houses = state.houses.filter(house => house.id !== action.payload);
      if (state.selectedHouse?.id === action.payload) {
        state.selectedHouse = null;
      }
    },
    addHouseImages: (state, action: PayloadAction<{ houseId: string; images: PropertyImage[] }>) => {
      const house = state.houses.find(h => h.id === action.payload.houseId);
      if (house) {
        house.images = [...house.images, ...action.payload.images];
        if (state.selectedHouse?.id === action.payload.houseId) {
          state.selectedHouse.images = house.images;
        }
      }
    },
    removeHouseImage: (state, action: PayloadAction<{ houseId: string; imageId: string }>) => {
      const house = state.houses.find(h => h.id === action.payload.houseId);
      if (house) {
        house.images = house.images.filter(img => img.id !== action.payload.imageId);
        if (state.selectedHouse?.id === action.payload.houseId) {
          state.selectedHouse.images = house.images;
        }
      }
    },
    addUnit: (state, action: PayloadAction<Unit>) => {
      state.units.push(action.payload);
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      const index = state.units.findIndex(unit => unit.id === action.payload.id);
      if (index !== -1) {
        state.units[index] = action.payload;
        if (state.selectedUnit?.id === action.payload.id) {
          state.selectedUnit = action.payload;
        }
      }
    },
    removeUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter(unit => unit.id !== action.payload);
      if (state.selectedUnit?.id === action.payload) {
        state.selectedUnit = null;
      }
    },
    addUnitImages: (state, action: PayloadAction<{ unitId: string; images: PropertyImage[] }>) => {
      const unit = state.units.find(u => u.id === action.payload.unitId);
      if (unit) {
        unit.images = [...unit.images, ...action.payload.images];
        if (state.selectedUnit?.id === action.payload.unitId) {
          state.selectedUnit.images = unit.images;
        }
      }
    },
    removeUnitImage: (state, action: PayloadAction<{ unitId: string; imageId: string }>) => {
      const unit = state.units.find(u => u.id === action.payload.unitId);
      if (unit) {
        unit.images = unit.images.filter(img => img.id !== action.payload.imageId);
        if (state.selectedUnit?.id === action.payload.unitId) {
          state.selectedUnit.images = unit.images;
        }
      }
    },
    addMaintenanceRecord: (state, action: PayloadAction<{ unitId: string; record: MaintenanceRecord }>) => {
      const unit = state.units.find(u => u.id === action.payload.unitId);
      if (unit) {
        unit.maintenanceHistory.push(action.payload.record);
        if (state.selectedUnit?.id === action.payload.unitId) {
          state.selectedUnit.maintenanceHistory = unit.maintenanceHistory;
        }
      }
    },
    updateMaintenanceRecord: (state, action: PayloadAction<{ unitId: string; record: MaintenanceRecord }>) => {
      const unit = state.units.find(u => u.id === action.payload.unitId);
      if (unit) {
        const index = unit.maintenanceHistory.findIndex(r => r.id === action.payload.record.id);
        if (index !== -1) {
          unit.maintenanceHistory[index] = action.payload.record;
          if (state.selectedUnit?.id === action.payload.unitId) {
            state.selectedUnit.maintenanceHistory = unit.maintenanceHistory;
          }
        }
      }
    },
    removeMaintenanceRecord: (state, action: PayloadAction<{ unitId: string; recordId: string }>) => {
      const unit = state.units.find(u => u.id === action.payload.unitId);
      if (unit) {
        unit.maintenanceHistory = unit.maintenanceHistory.filter(r => r.id !== action.payload.recordId);
        if (state.selectedUnit?.id === action.payload.unitId) {
          state.selectedUnit.maintenanceHistory = unit.maintenanceHistory;
        }
      }
    },
    addDocument: (state, action: PayloadAction<{ entityId: string; entityType: 'house' | 'unit'; document: PropertyDocument }>) => {
      const { entityId, entityType, document } = action.payload;
      if (entityType === 'house') {
        const house = state.houses.find(h => h.id === entityId);
        if (house) {
          house.documents.push(document);
          if (state.selectedHouse?.id === entityId) {
            state.selectedHouse.documents = house.documents;
          }
        }
      } else {
        const unit = state.units.find(u => u.id === entityId);
        if (unit) {
          unit.documents.push(document);
          if (state.selectedUnit?.id === entityId) {
            state.selectedUnit.documents = unit.documents;
          }
        }
      }
    },
    removeDocument: (state, action: PayloadAction<{ entityId: string; entityType: 'house' | 'unit'; documentId: string }>) => {
      const { entityId, entityType, documentId } = action.payload;
      if (entityType === 'house') {
        const house = state.houses.find(h => h.id === entityId);
        if (house) {
          house.documents = house.documents.filter(d => d.id !== documentId);
          if (state.selectedHouse?.id === entityId) {
            state.selectedHouse.documents = house.documents;
          }
        }
      } else {
        const unit = state.units.find(u => u.id === entityId);
        if (unit) {
          unit.documents = unit.documents.filter(d => d.id !== documentId);
          if (state.selectedUnit?.id === entityId) {
            state.selectedUnit.documents = unit.documents;
          }
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setImageUploading: (state, action: PayloadAction<boolean>) => {
      state.imageUploading = action.payload;
    },
    setImageUploadError: (state, action: PayloadAction<string | null>) => {
      state.imageUploadError = action.payload;
    },
    setMaintenanceLoading: (state, action: PayloadAction<boolean>) => {
      state.maintenanceLoading = action.payload;
    },
    setMaintenanceError: (state, action: PayloadAction<string | null>) => {
      state.maintenanceError = action.payload;
    },
    setDocumentUploading: (state, action: PayloadAction<boolean>) => {
      state.documentUploading = action.payload;
    },
    setDocumentUploadError: (state, action: PayloadAction<string | null>) => {
      state.documentUploadError = action.payload;
    },
  },
});

export const {
  setHouses,
  setSelectedHouse,
  setUnits,
  setSelectedUnit,
  addHouse,
  updateHouse,
  removeHouse,
  addHouseImages,
  removeHouseImage,
  addUnit,
  updateUnit,
  removeUnit,
  addUnitImages,
  removeUnitImage,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  removeMaintenanceRecord,
  addDocument,
  removeDocument,
  setLoading,
  setError,
  setImageUploading,
  setImageUploadError,
  setMaintenanceLoading,
  setMaintenanceError,
  setDocumentUploading,
  setDocumentUploadError,
} = propertySlice.actions;

export default propertySlice.reducer;