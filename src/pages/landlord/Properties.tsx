import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Grid,
  List,
  Home,
} from 'lucide-react';
import { House, Unit, PropertyFormData, UnitFormData } from '../../components/properties/types/property';
import { usePropertyApi } from '../../components/hook/usePropertyApi';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import SuccessMessage from '../../components/ui/SuccessMessage';
import PropertyCard from '../../components/properties/cards/PropertyCard';
import UnitCard from '../../components/properties/cards/UnitCard';
import PropertyForm from '../../components/properties/forms/PropertyForm';
import UnitForm from '../../components/properties/forms/UnitForm';
import DeleteModal from '../../components/properties/modals/DeleteModal';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Properties: React.FC = () => {
  const {
    useGetHousesQuery,
    useGetUnitsQuery,
    useCreateHouseMutation,
    useUpdateHouseMutation,  
    useDeleteHouseMutation,
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useDeleteUnitMutation,
    error,
    success,
    showError,
    showSuccess,
    clearMessages
  } = usePropertyApi();

  const { 
    data, 
    isLoading, 
    error: queryError, 
    refetch: refetchProperties 
  } = useGetHousesQuery({}, { refetchOnMountOrArgChange: true, refetchOnReconnect: true });

  const houses = data?.data || [];

  const [createHouse, { isLoading: isCreating }] = useCreateHouseMutation();
  const [updateHouse, { isLoading: isUpdating }] = useUpdateHouseMutation();
  const [deleteHouse, { isLoading: isDeleting }] = useDeleteHouseMutation();

  const [createUnit, { isLoading: isCreatingUnit }] = useCreateUnitMutation();
  const [updateUnit, { isLoading: isUpdatingUnit }] = useUpdateUnitMutation();
  const [deleteUnit, { isLoading: isDeletingUnit }] = useDeleteUnitMutation();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showUnitsView, setShowUnitsView] = useState(false);
  const [editing, setEditing] = useState<House | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<House | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'residential' | 'commercial'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtering logic
  const filteredHouses = houses.filter((house: House) => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      house.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || house.propertyType === filterType;
    const matchesStatus = filterStatus === 'all' || house.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const {
    data: unitsData,
    isLoading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits,
  } = useGetUnitsQuery(selectedProperty?.id, {
    skip: !showUnitsView || !selectedProperty,
  });

  const units = unitsData?.data || [];

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
    clearMessages();
  };

  const handleEdit = (property: House) => {
    setEditing(property);
    setShowForm(true);
    clearMessages();
  };

  const handleManageUnits = (property: House) => {
    setSelectedProperty(property);
    setShowUnitsView(true);
    clearMessages();
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    clearMessages();
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowUnitForm(true);
    clearMessages();
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowUnitForm(true);
    clearMessages();
  };

  const handleDeleteUnit = (id: string) => {
    setDeleteUnitId(id);
    clearMessages();
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteHouse(deleteId).unwrap();
        showSuccess('Property deleted successfully');
        setDeleteId(null);
        refetchProperties();
        if (showUnitsView && selectedProperty?.id === deleteId) {
          setShowUnitsView(false);
          setSelectedProperty(null);
        }
      } catch (error) {
        const apiError = error as ApiError;
        showError(apiError.response?.data?.message || 'Failed to delete property');
      }
    }
  };

  const confirmDeleteUnit = async () => {
    if (deleteUnitId) {
      try {
        await deleteUnit(deleteUnitId).unwrap();
        showSuccess('Unit deleted successfully');
        setDeleteUnitId(null);
        refetchUnits();
      } catch (error) {
        const apiError = error as ApiError;
        showError(apiError.response?.data?.message || 'Failed to delete unit');
      }
    }
  };

  // Fixed FormData handling for properties
  const handleFormSubmit = async (data: PropertyFormData) => {
  try {
    const formData = new FormData();
    
    // Append all simple fields
    const simpleFields = [
      'name', 'address', 'description', 'propertyType', 
      'totalFlats', 'parkingSpaces', 'maintenanceContact', 
      'emergencyContact', 'managerId', 'status'
    ];

    simpleFields.forEach(field => {
      const value = data[field as keyof PropertyFormData];
      if (value !== undefined && value !== null) {
        formData.append(field, value.toString());
      }
    });

    // Handle arrays properly
    if (Array.isArray(data.amenities)) {
      data.amenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}]`, amenity);
      });
    }

    if (Array.isArray(data.commonAreas)) {
      data.commonAreas.forEach((area, index) => {
        formData.append(`commonAreas[${index}]`, area);
      });
    }

    // Handle nested objects
    if (data.location) {
      formData.append('location', JSON.stringify(data.location));
    }

    if (data.features) {
      formData.append('features', JSON.stringify(data.features));
    }

    // Handle images - separate existing from new
    const existingImages = data.images.filter(img => 
      typeof img === 'string' || (img && typeof img === 'object' && 'url' in img)
    );
    const newImages = data.images.filter(img => img instanceof File);

    // Append existing images as JSON array
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // Append new images as files
    newImages.forEach((image) => {
      formData.append('images', image);
    });

    if (editing) {
      await updateHouse({ id: editing.id, formData }).unwrap();
      showSuccess('Property updated successfully');
    } else {
      await createHouse(formData).unwrap();
      showSuccess('Property created successfully');
    }
    
    setShowForm(false);
    setEditing(null);
    refetchProperties();
    
  } catch (error) {
    console.error('Error saving property:', error);
    const apiError = error as ApiError;
    showError(apiError.response?.data?.message || 'Failed to save property');
  }
};

  // Fixed unit form submission
  const handleUnitFormSubmit = async (data: UnitFormData) => {
  if (!selectedProperty) return;
  
  try {
    const formData = new FormData();
    
    // Append all simple fields
    const simpleFields = [
      'name', 'number', 'description', 'floorNumber', 'size', 
      'bedrooms', 'palour', 'toilet', 'kitchen', 'bathrooms', 
      'furnished', 'rentAmount', 'depositAmount', 'rentDueDay', 
      'tenantId', 'status', 'houseId'
    ];

    simpleFields.forEach(field => {
      const value = data[field as keyof UnitFormData];
      if (value !== undefined && value !== null) {
        // Convert boolean to string
        if (typeof value === 'boolean') {
          formData.append(field, value.toString());
        } else {
          formData.append(field, value.toString());
        }
      }
    });

    // Handle arrays properly
    if (Array.isArray(data.utilities)) {
      data.utilities.forEach((utility, index) => {
        formData.append(`utilities[${index}]`, utility);
      });
    }

    // Handle nested features
    if (data.features) {
      formData.append('features', JSON.stringify(data.features));
    }

    // Handle images - separate existing from new
    const existingImages = data.images.filter(img => 
      typeof img === 'string' || (img && typeof img === 'object' && 'url' in img)
    );
    const newImages = data.images.filter(img => img instanceof File);

    // Append existing images as JSON array
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // Append new images as files
    newImages.forEach((image) => {
      formData.append('images', image);
    });

    if (editingUnit) {
      await updateUnit({ id: editingUnit.id, formData }).unwrap();
      showSuccess('Unit updated successfully');
    } else {
      await createUnit({ houseId: selectedProperty.id, formData }).unwrap();
      showSuccess('Unit created successfully');
    }
    
    setShowUnitForm(false);
    setEditingUnit(null);
    refetchUnits();
    
  } catch (error) {
    console.error('Error saving unit:', error);
    const apiError = error as ApiError;
    showError(apiError.response?.data?.message || 'Failed to save unit');
  }
};
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading properties..." />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="p-6">
        <ErrorMessage 
          message="Failed to load properties. Please check your connection and try again." 
          onRetry={() => refetchProperties()}
        />
      </div>
    );
  }

  // Units view
  if (showUnitsView && selectedProperty) {
    return (
      <div className="space-y-6">
        {success && <SuccessMessage message={success} />}
        {error && <ErrorMessage message={error} />}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              icon={<Building2 size={20} />}
              onClick={() => {
                setShowUnitsView(false);
                setSelectedProperty(null);
                refetchProperties();
              }}
            >
              Back to Properties
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedProperty.name}</h1>
              <p className="text-gray-600">{selectedProperty.address}</p>
            </div>
          </div>
          <Button variant="primary" icon={<Plus size={20} />} onClick={handleAddUnit}>
            Add Unit
          </Button>
        </div>

        {unitsLoading ? (
          <div className="flex items-center justify-center min-h-48">
            <LoadingSpinner size="md" text="Loading units..." />
          </div>
        ) : unitsError ? (
          <div className="p-6">
            <ErrorMessage 
              message="Failed to load units. Please try again."
              onRetry={() => refetchUnits()}
            />
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No units yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first unit to this property</p>
            <Button variant="primary" icon={<Plus size={20} />} onClick={handleAddUnit}>
              Add Your First Unit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit: Unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit}
              />
            ))}
          </div>
        )}

        {showUnitForm && (
          <UnitForm
            houseId={selectedProperty.id}
            initial={editingUnit || undefined}
            onSubmit={handleUnitFormSubmit}
            onClose={() => setShowUnitForm(false)}
            loading={isCreatingUnit || isUpdatingUnit}
          />
        )}

        <DeleteModal
          open={deleteUnitId !== null}
          onConfirm={confirmDeleteUnit}
          onCancel={() => setDeleteUnitId(null)}
          loading={isDeletingUnit}
          title="Delete Unit"
          message="Are you sure you want to delete this unit? All associated data will be permanently removed."
        />
      </div>
    );
  }

  // Main properties view
  return (
    <div className="space-y-6">
      {success && <SuccessMessage message={success} />}
      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your rental properties and units</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              icon={<Grid size={16} />}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              icon={<List size={16} />}
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </div>
          <Button variant="primary" icon={<Plus size={20} />} onClick={handleAdd}>
            Add Property
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'residential' | 'commercial')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'maintenance')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>{filteredHouses.length} properties found</span>
          </div>
        </div>
      </div>

      {filteredHouses.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first property'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Button variant="primary" icon={<Plus size={20} />} onClick={handleAdd}>
              Add Your First Property
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredHouses.map((property: House) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageUnits={handleManageUnits}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PropertyForm
          initial={editing || ""}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          loading={isCreating || isUpdating}
        />
      )}
 
      <DeleteModal
        open={deleteId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        title="Delete Property"
        message="Are you sure you want to delete this property? All associated units and data will be permanently removed."
      />
    </div>
  );
};

export default Properties;