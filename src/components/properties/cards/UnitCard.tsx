import React from 'react';
import { 
  Edit2, 
  Trash2, 
  Home,
  Bed,
  Bath,
  User,
  CheckCircle,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { Unit } from '../types/property';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface UnitCardProps {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onDelete: (id: string) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <CheckCircle className="w-4 h-4" />;
      case 'vacant': return <Home className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Handle different image formats (string, object with url, or object with url property)
  const getImageUrl = (image: any): string => {
    if (typeof image === 'string') return image;
    if (typeof image === 'object' && image.url) return image.url;
    if (typeof image === 'object' && image.path) return image.path;
    return 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const primaryImage = unit.images && unit.images.length > 0 
    ? getImageUrl(unit.images[0])
    : 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400';

  // Get tenant information
  const getTenantInfo = () => {
  if (!unit.tenantId && !unit.tenant) return null;
  
  // Handle both tenantId (object) and tenant (populated) formats
  const tenantData = unit.tenant || unit.tenantId;
  
  if (typeof tenantData === 'object' && tenantData !== null) {
    return {
      name: tenantData.name || 'Unknown Tenant',
      id: tenantData._id || tenantData.id
    };
  }
  
  return {
    name: 'Tenant',
    id: unit.tenantId
  };
};
  const tenantInfo = getTenantInfo();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={primaryImage}
          alt={unit.name}
          className="w-full h-32 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
            {getStatusIcon(unit.status)}
            <span className="ml-1 capitalize">{unit.status}</span>
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-md font-semibold text-gray-900">{unit.name}</h4>
            <p className="text-sm text-gray-500">Unit No: {unit.number}</p>
            {tenantInfo && (
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <User className="w-3 h-3 mr-1 text-gray-400" />
                <span className="font-medium text-green-600">
                  {tenantInfo.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {unit.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{unit.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center space-x-1">
            <Bed className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">{unit.bedrooms || 0} Bed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">{unit.bathrooms || 0} Bath</span>
          </div>
          <div className="flex items-center space-x-1">
            <Home className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Floor {unit.floorNumber || 1}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">₦{(unit.rentAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {unit.palour && (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">Parlour</span>
          )}
          {unit.kitchen && (
            <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">Kitchen</span>
          )}
          {unit.furnished && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">Furnished</span>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex space-x-1">
            <Button variant="secondary" size="sm" icon={<Edit2 size={14} />} onClick={() => onEdit(unit)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onDelete(unit.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UnitCard;