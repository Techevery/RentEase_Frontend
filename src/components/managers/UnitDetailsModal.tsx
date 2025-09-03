import React from 'react';
import Modal from '../../components/ui/Modal';
import { Home, User, Phone, Mail, Calendar, MapPin} from 'lucide-react';

interface Tenant {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  emergencyContact?: string;
  rentAmount?: number;
  leaseStart?: string;
  leaseEnd?: string;
  status?: string;
}

interface Unit {
  _id: string;
  number: string;
  status: string;
  type?: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  tenant?: Tenant;
  property?: {
    name: string;
    address: string;
  };
}

interface UnitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitData: Unit | null;
}

const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({
  isOpen,
  onClose,
  unitData
}) => {
  if (!unitData) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unit Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Unit Basic Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Unit {unitData.number}
              </h2>
              <p className="text-sm text-gray-600">
                {unitData.property?.name || 'Unknown Property'}
              </p>
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                unitData.status === 'occupied' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {unitData.status?.toUpperCase() || 'VACANT'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span>Type: {unitData.type || 'N/A'}</span>
            </div> */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Size:</span>
              <span>{unitData.size ? `${unitData.size} sq ft` : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Bedrooms:</span>
              <span>{unitData.bedrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Bathrooms:</span>
              <span>{unitData.bathrooms || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Property Information */}
        {unitData.property && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Property Information
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{unitData.property.name}</p>
              <p className="text-gray-600">{unitData.property.address}</p>
            </div>
          </div>
        )}

        {/* Tenant Information */}
        {unitData.tenant && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Current Tenant
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{unitData.tenant.name}</p>
                  <p className="text-sm text-gray-600">{unitData.tenant.status || 'Active'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{unitData.tenant.phone}</span>
                </div>
                {unitData.tenant.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{unitData.tenant.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                 
                  <span className="font-medium">{formatCurrency(unitData.tenant.rentAmount)}/Yr</span>
                </div>
                {unitData.tenant.emergencyContact && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>Emergency: {unitData.tenant.emergencyContact}</span>
                  </div>
                )}
              </div>

              {(unitData.tenant.leaseStart || unitData.tenant.leaseEnd) && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Lease Period
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Start: </span>
                      <span>{formatDate(unitData.tenant.leaseStart)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End: </span>
                      <span>{formatDate(unitData.tenant.leaseEnd)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {unitData.amenities && unitData.amenities.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {unitData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        
        </div>
      </div>
    </Modal>
  );
};

export default UnitDetailsModal;