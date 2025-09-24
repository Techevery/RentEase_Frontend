import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import PersonalInfoForm from './PersonalInfoForm';
import { Tenant } from '../../types/index';

interface House {
  _id: string;
  name: string;
}

interface TenantFormProps {
  initial?: Partial<Tenant>;
  onSubmit: (data: Partial<Tenant>) => void;
  onClose: () => void;
  houses: House[];
}

// Create a type that allows string values for numeric fields during editing
interface TenantFormState extends Omit<Partial<Tenant>, 'rentAmount' | 'cautionFee' | 'serviceCharge' | 'agencyFee' | 'legalFee' | 'yearsAtCurrentAddress' | 'monthsAtCurrentAddress'> {
  rentAmount: number | string;
  cautionFee: number | string;
  serviceCharge: number | string;
  agencyFee: number | string;
  legalFee: number | string;
  yearsAtCurrentAddress: number | string;
  monthsAtCurrentAddress: number | string;
}

const TenantForm: React.FC<TenantFormProps> = ({ initial = {}, onSubmit, onClose, houses }) => {
  const [form, setForm] = useState<TenantFormState>({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    property: initial.property?._id || initial.property || '',
    leaseStartDate: initial.leaseStartDate || '',
    leaseEndDate: initial.leaseEndDate || '',
    rentAmount: initial.rentAmount ?? '',
    cautionFee: initial.cautionFee ?? '',
    serviceCharge: initial.serviceCharge ?? '',
    agencyFee: initial.agencyFee ?? '',
    legalFee: initial.legalFee ?? '',
    totalRent: initial.totalRent ?? 0,
    emergencyContact: initial.emergencyContact || '',
    // New personal info fields
    maritalStatus: initial.maritalStatus || '',
    gender: initial.gender || '',
    dateOfBirth: initial.dateOfBirth || '',
    nationality: initial.nationality || '',
    currentAddress: initial.currentAddress || '',
    yearsAtCurrentAddress: initial.yearsAtCurrentAddress ?? '',
    monthsAtCurrentAddress: initial.monthsAtCurrentAddress ?? '',
    reasonForLeaving: initial.reasonForLeaving || '',
    occupation: initial.occupation || '',
    position: initial.position || '',
    spouseName: initial.spouseName || '',
    emergencyContactName: initial.emergencyContactName || '',
    emergencyContactAddress: initial.emergencyContactAddress || '',
  });

  // Calculate end date when start date changes
  const calculateEndDate = (startDate: string) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    
    return end.toISOString().split('T')[0];
  };

  // Calculate total rent
  const calculateTotalRent = (rent: number | string, caution: number | string, service: number | string, agency: number | string, legal: number | string) => {
    const rentNum = typeof rent === 'string' && rent !== '' ? Number(rent) : (rent || 0);
    const cautionNum = typeof caution === 'string' && caution !== '' ? Number(caution) : (caution || 0);
    const serviceNum = typeof service === 'string' && service !== '' ? Number(service) : (service || 0);
    const agencyNum = typeof agency === 'string' && agency !== '' ? Number(agency) : (agency || 0);
    const legalNum = typeof legal === 'string' && legal !== '' ? Number(legal) : (legal || 0);
    
    return rentNum + cautionNum + serviceNum + agencyNum + legalNum;
  };

  // Update end date when start date changes (only for new tenants)
  useEffect(() => {
    if (form.leaseStartDate && !initial._id) {
      const endDate = calculateEndDate(form.leaseStartDate as string);
      setForm(prev => ({
        ...prev,
        leaseEndDate: endDate
      }));
    }
  }, [form.leaseStartDate, initial._id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields - allow empty string
    const numericFields = [
      'rentAmount', 'cautionFee', 'serviceCharge', 'agencyFee', 'legalFee', 
      'yearsAtCurrentAddress', 'monthsAtCurrentAddress'
    ];
    
    let processedValue: string | number = value;
    
    if (numericFields.includes(name)) {
      processedValue = value === '' ? '' : Number(value);
    }

    const updatedForm = {
      ...form,
      [name]: processedValue,
    };

    // Recalculate total rent if any amount field changes
    if (name === 'rentAmount' || name === 'cautionFee' || name === 'serviceCharge' || 
        name === 'agencyFee' || name === 'legalFee') {
      updatedForm.totalRent = calculateTotalRent(
        name === 'rentAmount' ? processedValue : form.rentAmount,
        name === 'cautionFee' ? processedValue : form.cautionFee,
        name === 'serviceCharge' ? processedValue : form.serviceCharge,
        name === 'agencyFee' ? processedValue : form.agencyFee,
        name === 'legalFee' ? processedValue : form.legalFee
      );
    }

    setForm(updatedForm);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const updatedForm = {
      ...form,
      [name]: value,
    };

    // Calculate end date when start date changes (only for new tenants)
    if (name === 'leaseStartDate' && !initial._id) {
      updatedForm.leaseEndDate = calculateEndDate(value);
    }

    setForm(updatedForm);
  };

  // Helper function to get numeric field value for display
  const getNumericValue = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '';
    return value.toString();
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Convert form data for submission
  const prepareSubmitData = (formData: TenantFormState): Partial<Tenant> => {
    return {
      ...formData,
      rentAmount: formData.rentAmount === '' ? 0 : Number(formData.rentAmount),
      cautionFee: formData.cautionFee === '' ? 0 : Number(formData.cautionFee),
      serviceCharge: formData.serviceCharge === '' ? 0 : Number(formData.serviceCharge),
      agencyFee: formData.agencyFee === '' ? 0 : Number(formData.agencyFee),
      legalFee: formData.legalFee === '' ? 0 : Number(formData.legalFee),
      yearsAtCurrentAddress: formData.yearsAtCurrentAddress === '' ? 0 : Number(formData.yearsAtCurrentAddress),
      monthsAtCurrentAddress: formData.monthsAtCurrentAddress === '' ? 0 : Number(formData.monthsAtCurrentAddress),
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg my-8 max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-4">{initial._id ? 'Edit' : 'Add'} Tenant</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(prepareSubmitData(form));
          }}
          className="space-y-4 flex-1 overflow-y-auto pr-2"
        >
          <input 
            name="name" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            type="email" 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="phone" 
            placeholder="Phone" 
            value={form.phone} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
            required 
          />
          <input 
            name="emergencyContact" 
            placeholder="Emergency Contact" 
            value={form.emergencyContact} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2" 
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
            <select 
              name="property" 
              value={form.property as string} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2" 
              required
            >
              <option value="">Select Property</option>
              {houses.map((house: House) => (
                <option key={house._id} value={house._id}>{house.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input 
                name="leaseStartDate" 
                type="date" 
                value={formatDateForInput(form.leaseStartDate as string)} 
                onChange={handleDateChange} 
                className="w-full border rounded px-3 py-2" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input 
                name="leaseEndDate" 
                type="date" 
                value={formatDateForInput(form.leaseEndDate as string)} 
                onChange={handleDateChange} 
                className="w-full border rounded px-3 py-2" 
                required 
                disabled={!initial._id} // Disable end date for new tenants (auto-calculated)
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount (Annual)</label>
              <input 
                name="rentAmount" 
                type="number" 
                value={getNumericValue(form.rentAmount)} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                min={0} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Charge (Annual)</label>
              <input 
                name="serviceCharge" 
                type="number" 
                value={getNumericValue(form.serviceCharge)} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                min={0} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caution Fee (Refundable)</label>
              <input 
                name="cautionFee" 
                type="number" 
                value={getNumericValue(form.cautionFee)} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                min={0} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency Fee</label>
              <input 
                name="agencyFee" 
                type="number" 
                value={getNumericValue(form.agencyFee)} 
                onChange={handleChange} 
                className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                min={0} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legal Fee (Agreement)</label>
            <input 
              name="legalFee" 
              type="number" 
              value={getNumericValue(form.legalFee)} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              min={0} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (Annual)</label>
            <input 
              name="totalRent" 
              type="number" 
              value={form.totalRent} 
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>

          {/* Personal Information Form */}
          <PersonalInfoForm form={form} handleChange={handleChange} formatDateForInput={formatDateForInput} />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initial._id ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;