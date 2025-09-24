// PersonalInfoForm.tsx
import React from 'react';

interface PersonalInfoFormProps {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  formatDateForInput: (dateString: string | undefined) => string;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ form, handleChange, formatDateForInput }) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-3">Personal Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
          <select 
            name="maritalStatus" 
            value={form.maritalStatus} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
           
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select 
            name="gender" 
            value={form.gender} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input 
          name="dateOfBirth" 
          type="date" 
          value={formatDateForInput(form.dateOfBirth)} 
          onChange={handleChange} 
          className="w-full border rounded px-3 py-2" 
        />
      </div>

      <input 
        name="nationality" 
        placeholder="Nationality" 
        value={form.nationality} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
      />

      <textarea 
        name="currentAddress" 
        placeholder="Current Address" 
        value={form.currentAddress} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years at Current Address</label>
          <input 
            name="yearsAtCurrentAddress" 
            type="number" 
            value={form.yearsAtCurrentAddress} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            min={0} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Months at Current Address</label>
          <input 
            name="monthsAtCurrentAddress" 
            type="number" 
            value={form.monthsAtCurrentAddress} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            min={0} 
            max={11}
          />
        </div>
      </div>

      <textarea 
        name="reasonForLeaving" 
        placeholder="Reason for Leaving Previous Residence" 
        value={form.reasonForLeaving} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
        rows={2}
      />

      <input 
        name="occupation" 
        placeholder="Occupation" 
        value={form.occupation} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
      />

      <input 
        name="position" 
        placeholder="Position/Title" 
        value={form.position} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
      />

      <input 
        name="spouseName" 
        placeholder="Spouse Name (if married)" 
        value={form.spouseName} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
      />

      <input 
        name="emergencyContactName" 
        placeholder="Emergency Contact Name" 
        value={form.emergencyContactName} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
      />

      <textarea 
        name="emergencyContactAddress" 
        placeholder="Emergency Contact Address" 
        value={form.emergencyContactAddress} 
        onChange={handleChange} 
        className="w-full border rounded px-3 py-2" 
        rows={2}
      />
    </div>
  );
};

export default PersonalInfoForm;