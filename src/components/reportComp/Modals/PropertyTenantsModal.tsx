// import React, { useEffect, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { PropertyPerformanceItem, Tenant } from '../types';
import { useGetTenantsInHouseQuery} from '../../../redux/services/propertyApi'; // You'll need to create this


interface PropertyTenantsModalProps {
  property: PropertyPerformanceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTenantClick: (tenantId: string) => void;
}
interface PropertyUnit {
  flatId: string;
  flatNumber: string;
  floorNumber: number;
  tenant: Tenant;
}

const PropertyTenantsModal: React.FC<PropertyTenantsModalProps> = ({
  property,
  isOpen,
  onClose,
  onTenantClick
}) => {
  // Fetch tenants for the specific property
  const { data: tenantsResponse, isLoading, error } =  useGetTenantsInHouseQuery(
    property?.property.id || '',
    { skip: !property?.property.id || !isOpen }
  );

  // Extract tenants from the response
  const tenants = tenantsResponse?.data || [];

  if (!property) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tenants - ${property.property.name}`}>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading tenants...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500 text-center">
              <p className="font-semibold">Error loading tenants</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No tenants found for this property</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lease Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((unit: PropertyUnit) => (
                <tr key={unit.flatId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.tenant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.tenant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.tenant.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Flat {unit.flatNumber} (Floor {unit.floorNumber})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      new Date(unit.tenant.leaseEnd) > new Date()
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {new Date(unit.tenant.leaseEnd) > new Date() ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTenantClick(unit.tenant.id || unit.tenant._id)}
                    >
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Summary footer */}
      {tenants.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total tenants: <span className="font-medium">{tenants.length}</span>
          </p>
        </div>
      )}
    </Modal>
  );
};

export default PropertyTenantsModal;