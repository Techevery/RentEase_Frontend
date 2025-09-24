import React, { useState, useEffect } from 'react';
import { UnitFormData, Unit } from '../../../components/properties/types/property';
import Button from '../../ui/Button';
import { useGetTenantsQuery } from '../../../redux/services/tenantApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UnitFormProps {
  houseId: string;
  initial?: Partial<Unit> | "";
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
  // Handle the case where initial might be an empty string
  const initialData = initial === "" ? {} : initial;

  const [form, setForm] = useState<UnitFormData>({
    name: initialData.name || '',
    number: initialData.number || '',
    description: initialData.description || '',
    floorNumber: initialData.floorNumber || 1,
    size: initialData.size || 0,
    bedrooms: initialData.bedrooms || 1,
    palour: initialData.palour || false,
    toilet: initialData.toilet || 1,
    kitchen: initialData.kitchen || false,
    bathrooms: initialData.bathrooms || 1,
    furnished: initialData.furnished || false,
    rentAmount: initialData.rentAmount || 0,
    depositAmount: initialData.depositAmount || 0,
    rentDueDay: initialData.rentDueDay || 1,
    utilities: initialData.utilities || [],
    features: initialData.features || {
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
    images: initialData.images || [],
    tenantId: initialData.tenantId || '',
    status: (initialData.status as UnitFormData['status']) || 'vacant',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<any[]>(
    Array.isArray(initialData.images) 
      ? initialData.images.filter(img => img && (typeof img === 'string' || (typeof img === 'object' && img.url)))
      : []
  );
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: tenantsData } = useGetTenantsQuery({});
  const tenants = tenantsData?.data || [];

  // Load image previews and set form data
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
    setForm(prev => ({ ...prev, houseId }));
  }, [existingImages, houseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormErrors(prev => ({ ...prev, [name]: '' }));
 if (name === 'tenantId') {
    const newStatus = value ? 'occupied' as const : 'vacant' as const;
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
        [name]: Math.max(numValue, name === 'floorNumber' ? 1 : 0)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArr = Array.from(files);
    const newPreviews = fileArr.map(file => URL.createObjectURL(file));

    setNewImages(prev => [...prev, ...fileArr]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
        // Combine all images for submission
        const allImages = [...existingImages, ...newImages];
        
        // Ensure numeric fields are properly formatted
        const submitData = {
          ...form,
          images: allImages,
          floorNumber: Number(form.floorNumber),
          size: Number(form.size),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          toilet: Number(form.toilet),
          rentAmount: Number(form.rentAmount),
          depositAmount: Number(form.depositAmount),
          rentDueDay: Number(form.rentDueDay),
          // Auto-set status based on tenant assignment
            status: form.tenantId ? 'occupied' as const : 'vacant' as const
        };
        
        await onSubmit(submitData);
        
        // Clean up object URLs
        imagePreviews.forEach(preview => {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        });
        
      } catch (error: any) {
        console.error('Submit error:', error);
        toast.error(error.response?.data?.message || error.message || 'An error occurred while saving the unit');
      }
    }
  };

  // RETURN THE JSX - This was missing
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData.id ? 'Edit Unit' : 'Add New Unit'}
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

          {/* Status Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className={`px-3 py-2 rounded ${
              form.status === 'occupied' ? 'bg-green-100 text-green-800' :
              form.status === 'vacant' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {form.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : 'Vacant'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Status is automatically set to "Occupied" when a tenant is assigned
            </p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Rent Due Day (1-31)</label>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="rentDueDay" 
              value={form.rentDueDay} 
              onChange={handleInputChange} 
              className={`w-full border ${formErrors.rentDueDay ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
            />
            {formErrors.rentDueDay && <p className="mt-1 text-sm text-red-600">{formErrors.rentDueDay}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded overflow-hidden">
                  <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)} 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {initialData.id ? 'Update Unit' : 'Create Unit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitForm;