import React, { useState, useRef, useEffect } from 'react';
import {Image as ImageIcon, X as XIcon } from 'lucide-react';
import { PropertyFormData, House } from '../../../components/properties/types/property';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useGetManagersQuery } from '../../../redux/services/landlordApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PropertyFormProps {
  initial?: Partial<House> | "";
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

interface NumberInputProps {
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  min?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const NumberInput = ({
  name,
  value,
  onChange,
  min = 0,
  error,
  className = '',
  ...props
}: NumberInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = numericValue ? parseInt(numericValue, 10) : min;
    onChange(name, Math.max(numValue, min));
  };

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name={name}
        value={value.toString()}
        onChange={handleChange}
        className={`w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const PropertyForm: React.FC<PropertyFormProps> = ({
  initial = {},
  onSubmit,
  onClose,
  loading = false,
}) => {
  // Handle the case where initial might be an empty string
  const initialData = initial === "" ? {} : initial;

  const [form, setForm] = useState<PropertyFormData>({
    name: initialData.name || '',
    address: initialData.address || '',
    description: initialData.description || '',
    propertyType: initialData.propertyType || 'residential',
    totalFlats: initialData.totalFlats || 1,
    amenities: initialData.amenities || [],
    parkingSpaces: initialData.parkingSpaces || 0,
    commonAreas: initialData.commonAreas || [],
    maintenanceContact: initialData.maintenanceContact || '',
    emergencyContact: initialData.emergencyContact || '',
    features: initialData.features || {
      hasElevator: false,
      hasGenerator: false,
      hasSecurity: false,
      hasGym: false,
      hasPool: false,
      hasPlayground: false,
      hasGarden: false,
      hasCCTV: false,
      hasVisitorParking: false,
      hasWaterTreatment: false,
      hasWifi: false,
      amenities: [],
    },
    location: initialData.location || {
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: '',
    },
    images: initialData.images || [],
    managerId: initialData.managerId?.toString() || '',
    status: initialData.status || 'active',
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newCommonArea, setNewCommonArea] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { data: managerData, isLoading: managersLoading } = useGetManagersQuery();
  const managers = managerData?.data || [];

  // Fix image state management
  const [existingImages, setExistingImages] = useState<any[]>(
    Array.isArray(initialData.images) 
      ? initialData.images.filter(img => img && (typeof img === 'string' || (typeof img === 'object' && img.url)))
      : []
  );
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image previews on component mount
  useEffect(() => {
    const loadImagePreviews = () => {
      const previews: string[] = [];
      
      // Add existing image URLs
      existingImages.forEach(img => {
        if (typeof img === 'string') {
          previews.push(img);
        } else if (img && typeof img === 'object' && img.url) {
          previews.push(img.url);
        }
      });
      
      setImagePreviews(previews);
    };

    loadImagePreviews();
  }, [existingImages]);

  const handleNumberChange = (name: string, value: number) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'totalFlats' || name === 'parkingSpaces') {
      const numValue = parseInt(value) || 0;
      setForm(prev => ({
        ...prev,
        [name]: Math.max(name === 'totalFlats' ? 1 : 0, numValue)
      }));
    } else if (name.startsWith('features.')) {
      const featureKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else if (name.startsWith('location.')) {
      const locationKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationKey]: value,
        },
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArr = Array.from(files);
    const newPreviews = fileArr.map(file => URL.createObjectURL(file));

    setNewImages(prev => [...prev, ...fileArr]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      // Remove existing image
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove new image
      const newIndex = index - existingImages.length;
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !form.amenities.includes(newAmenity.trim())) {
      setForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const addCommonArea = () => {
    if (newCommonArea.trim() && !form.commonAreas.includes(newCommonArea.trim())) {
      setForm(prev => ({
        ...prev,
        commonAreas: [...prev.commonAreas, newCommonArea.trim()],
      }));
      setNewCommonArea('');
    }
  };

  const removeCommonArea = (area: string) => {
    setForm(prev => ({
      ...prev,
      commonAreas: prev.commonAreas.filter((a) => a !== area),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      errors.name = 'Property name is required';
    }
    if (!form.address.trim()) {
      errors.address = 'Property address is required';
    }
    if (!form.emergencyContact) {
      errors.emergencyContact = 'Emergency contact is required';
    }
    if (isNaN(form.totalFlats) || form.totalFlats <= 0) {
      errors.totalFlats = 'Total flats must be at least 1';
    }
    if (!form.propertyType) {
      errors.propertyType = 'Property type is required';
    }
    
    if (form.parkingSpaces < 0) {
      errors.parkingSpaces = 'Parking spaces cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isNaN(form.totalFlats) || form.totalFlats <= 0) {
    setFormErrors(prev => ({
      ...prev,
      totalFlats: 'Total flats must be at least 1'
    }));
    return;
  }

  if (validateForm()) {
    try {
      // Combine all images for submission - FIXED
      const allImages = [...existingImages, ...newImages];
      
      // Ensure numeric fields are properly formatted
      const submitData = {
        ...form,
        images: allImages,
        managerId: form.managerId || undefined,
        totalFlats: Number(form.totalFlats),
        parkingSpaces: Number(form.parkingSpaces),
        // Ensure status is included for updates
        status: form.status || 'active'
      };
      
      await onSubmit(submitData);
      
      // Clean up object URLs
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
      
      toast.success(initialData.id ? 'Property updated successfully!' : 'Property created successfully!');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred while saving the property');
    }
  }
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData.id ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <LoadingSpinner size="lg" text="Saving property..." />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Images
            </label>
            <div className="flex flex-wrap gap-4 mb-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={src}
                    alt={`Property Preview ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100"
                    onClick={() => removeImage(idx)}
                    disabled={loading}
                    aria-label="Remove image"
                  >
                    <XIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                aria-label="Add image"
              >
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-400">
              Upload high-quality images (JPG, PNG). You can select multiple files.
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.propertyType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
              {formErrors.propertyType && <p className="mt-1 text-sm text-red-600">{formErrors.propertyType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
              disabled={loading}
            />
            {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Flats *
              </label>
              <NumberInput
                name="totalFlats"
                value={form.totalFlats}
                onChange={handleNumberChange}
                required
                disabled={loading}
                error={formErrors.totalFlats}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking Spaces
              </label>
              <NumberInput
                name="parkingSpaces"
                value={form.parkingSpaces}
                onChange={handleNumberChange}
                disabled={loading}
                error={formErrors.parkingSpaces}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact *
              </label>
              <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleInputChange}
              required
              disabled={loading}
              className={`w-full px-3 py-2 border ${formErrors.emergencyContact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {formErrors.emergencyContact && (
              <p className="mt-1 text-sm text-red-600">{formErrors.emergencyContact}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Contact
              </label>
               <input
                type="text"
                inputMode="numeric"
                 pattern="[0-9]*"
                name="maintenanceContact"
                value={form.maintenanceContact}
                onChange={handleInputChange}
                disabled={loading}
                 className={`w-full px-3 py-2 border ${formErrors.maintenanceContact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    
              />
            </div>
          </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={form.status || 'active'}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
            </div>
                      {/* Amenities and Common Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Button type="button" onClick={addAmenity} disabled={loading}>
                Add
              </Button>
            </div>
            <ul className="mt-2 space-y-1">
              {form.amenities.map((amenity, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{amenity}</span>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeAmenity(amenity)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Common Areas
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCommonArea}
                onChange={(e) => setNewCommonArea(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Button type="button" onClick={addCommonArea} disabled={loading}>
                Add
              </Button>
            </div>
            <ul className="mt-2 space-y-1">
              {form.commonAreas.map((area, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{area}</span>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeCommonArea(area)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Manager Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Manager
            </label>
            <select
              name="managerId"
              value={form.managerId || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || managersLoading}
            >
              <option value="">Select a manager</option>
              {managers.map((manager: { id: string; name: string }) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {initialData.id ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;