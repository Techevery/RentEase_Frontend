import React, { useState, useEffect } from 'react';
import { UnitFormData, Unit } from '../../../components/properties/types/property';
import Button from '../../ui/Button';
import { useGetTenantsQuery } from '../../../redux/services/tenantApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UnitFormProps {
  houseId: string;
  initial?: Partial<Unit>;
  onSubmit: (data: UnitFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const UnitForm: React.FC<UnitFormProps> = ({ 
  houseId,  
  initial = {}, 
  onSubmit, 
  onClose, 
  loading = false 
}) => {
  const [form, setForm] = useState<UnitFormData>({
    name: initial.name || '',
    number: initial.number || '',
    description: initial.description || '',
    floorNumber: initial.floorNumber || 1,
    size: initial.size || 0,
    bedrooms: initial.bedrooms || 1,
    palour: initial.palour || false,
    toilet: initial.toilet || 1,
    kitchen: initial.kitchen || false,
    bathrooms: initial.bathrooms || 1,
    furnished: initial.furnished || false,
    rentAmount: initial.rentAmount || 0,
    depositAmount: initial.depositAmount || 0,
    rentDueDay: initial.rentDueDay || 1,
    utilities: initial.utilities || [],
    features: initial.features || {
      hasBalcony: false,
      hasParkingSpace: false,
      hasStorage: false,
      hasSecuritySystem: false,
      hasIntercom: false,
      furnishingStatus: 'unfurnished',
      airConditioned: false,
      orientation: 'north',
      floorType: 'tiles',
      ceilingHeight: 10,
      windowType: 'standard',
      amenities: [],
    },
    houseId: houseId,
    images: initial.images || [],
    tenantId: initial.tenantId || '',
    status: initial.status || 'vacant'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    Array.isArray(initial.images)
      ? initial.images
          .map((img: string | { url?: string }) =>
            typeof img === 'string' ? img : img?.url || ''
          )
          .filter(Boolean)
      : []
  );

  const { data: tenantsData } = useGetTenantsQuery({});
  const tenants = tenantsData?.data || [];

  useEffect(() => {
    setForm(prev => ({ ...prev, houseId }));
  }, [houseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'tenantId') {
      const newStatus = value ? 'occupied' : 'vacant';
      setForm(prev => ({
        ...prev,
        tenantId: value,
        status: newStatus
      }));
      return;
    }

    // Handle numeric fields with input sanitization
    const numericFields = ['floorNumber', 'size', 'bedrooms', 'toilet', 'bathrooms', 'rentAmount', 'depositAmount', 'rentDueDay'];
    if (numericFields.includes(name)) {
      const numericValue = value.replace(/[^0-9]/g, '');
      const numValue = numericValue ? parseInt(numericValue, 10) : 0;
      setForm(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else if (name.startsWith('features.')) {
      const featureKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                       type === 'number' ? Number(value) : value,
        },
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArr = Array.from(files);
    const newPreviews = fileArr.map(file => URL.createObjectURL(file));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...fileArr]
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name.trim()) errors.name = 'Unit name is required';
    if (!form.number.trim()) errors.number = 'Unit number is required';
    if (!form.description.trim()) errors.description = 'Description is required';
    if (form.floorNumber <= 0) errors.floorNumber = 'Invalid floor number';
    if (form.size <= 0) errors.size = 'Size must be positive';
    if (form.bedrooms <= 0) errors.bedrooms = 'Invalid bedroom count';
    if (form.toilet <= 0) errors.toilet = 'Invalid toilet count';
    if (form.bathrooms <= 0) errors.bathrooms = 'Invalid bathroom count';
    if (form.rentAmount <= 0) errors.rentAmount = 'Invalid rent amount';
    if (form.depositAmount < 0) errors.depositAmount = 'Invalid deposit amount';
    if (form.rentDueDay < 1 || form.rentDueDay > 31) errors.rentDueDay = 'Invalid due day';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(form);
        toast.success(initial.id ? 'Unit updated successfully!' : 'Unit created successfully!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || 'An error occurred while saving the unit');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {initial.id ? 'Edit Unit' : 'Add New Unit'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Name *</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleInputChange} 
                className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
                required 
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Number *</label>
              <input 
                type="text" 
                name="number" 
                value={form.number} 
                onChange={handleInputChange} 
                className={`w-full border ${formErrors.number ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
                required 
              />
              {formErrors.number && <p className="mt-1 text-sm text-red-600">{formErrors.number}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleInputChange} 
              className={`w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
              required
            ></textarea>
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant</label>
            <select 
              name="tenantId" 
              value={form.tenantId} 
              onChange={handleInputChange} 
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Tenant</option>
              {tenants.map((tenant: any) => (
                <option key={tenant._id} value={tenant._id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Floor *</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="floorNumber" 
              value={form.floorNumber} 
              onChange={handleInputChange} 
              className={`w-full border ${formErrors.floorNumber ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
              required 
            />
            {formErrors.floorNumber && <p className="mt-1 text-sm text-red-600">{formErrors.floorNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Size (sqft) *</label>
            <input 
              type="text" 
              name="size" 
              value={form.size} 
              onChange={handleInputChange} 
              pattern="[0-9]*"
              inputMode="numeric"
              className={`w-full border ${formErrors.size ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
              required 
            />
            {formErrors.size && <p className="mt-1 text-sm text-red-600">{formErrors.size}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms *</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="bedrooms" 
              value={form.bedrooms} 
              onChange={handleInputChange} 
              className={`w-full border ${formErrors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
              required 
            />
            {formErrors.bedrooms && <p className="mt-1 text-sm text-red-600">{formErrors.bedrooms}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms *</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="bathrooms" 
              value={form.bathrooms} 
              onChange={handleInputChange} 
              className={`w-full border ${formErrors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
              required 
            />
            {formErrors.bathrooms && <p className="mt-1 text-sm text-red-600">{formErrors.bathrooms}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rent (₦) *</label>
            <input 
              type="text" 
              name="rentAmount" 
              value={form.rentAmount} 
              onChange={handleInputChange} 
              pattern="[0-9]*"
              inputMode="numeric"
              className={`w-full border ${formErrors.rentAmount ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`} 
              required 
            />
            {formErrors.rentAmount && <p className="mt-1 text-sm text-red-600">{formErrors.rentAmount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deposit (₦)</label>
            <input 
              type="text" 
              name="depositAmount" 
              value={form.depositAmount} 
              onChange={handleInputChange} 
              pattern="[0-9]*"
              inputMode="numeric"
              className={`w-full border ${formErrors.depositAmount ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
            />
            {formErrors.depositAmount && <p className="mt-1 text-sm text-red-600">{formErrors.depositAmount}</p>}
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="palour" checked={form.palour} onChange={handleInputChange} /> 
              <span className="text-sm font-medium text-gray-700">Parlour</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="kitchen" checked={form.kitchen} onChange={handleInputChange} /> 
              <span className="text-sm font-medium text-gray-700">Kitchen</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleInputChange} /> 
              <span className="text-sm font-medium text-gray-700">Furnished</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <label>
              <span className="block text-sm font-medium text-gray-700">Upload Images</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full border border-gray-300 rounded px-3 py-2" 
              />
            </label>
            <div className="flex gap-2">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={src} 
                    alt={`Unit ${index + 1}`} 
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {initial.id ? 'Update' : 'Create'} Unit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitForm;