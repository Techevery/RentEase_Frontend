import React from 'react';
import { 
  MapPin, 
  Home,
  Car,
  Edit2,
  Trash2,
  User
} from 'lucide-react';
import { House, Unit } from '../../properties/types/property';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface PropertyCardProps {
  property: House;
  units?: Unit[];
  onEdit: (property: House) => void;
  onDelete: (id: string) => void;
  onManageUnits: (property: House) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onEdit, 
  onDelete, 
  onManageUnits, 
}) => {
  if (!property) {
    return null; 
  }

  // Handle different image formats (string, object with url, or object with url property)
  const getImageUrl = (image: any): string => {
    if (typeof image === 'string') return image;
    if (typeof image === 'object' && image.url) return image.url;
    if (typeof image === 'object' && image.path) return image.path;
    return 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  const primaryImage = property.images && property.images.length > 0 
    ? getImageUrl(property.images[0])
    : 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanListData = (data: any): string[] => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data.filter(item => item && item.trim().length > 0);
    }
    
    if (typeof data === 'string') {
      // Handle stringified arrays
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.trim().length > 0);
        }
      } catch (e) {
        // If not JSON, treat as comma-separated
        const cleaned = data.replace(/[\[\]"]/g, '');
        return cleaned.split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
    }
    
    return [];
  };

  // Format amenities and common areas
  const amenities = cleanListData(property.amenities);
  const commonAreas = cleanListData(property.commonAreas);

  // Get manager information
 const getManagerInfo = () => {
  if (!property.managerId && !property.manager) return null;
  
  // Handle both managerId (object) and manager (populated) formats
  const managerData = property.manager || property.managerId;
  
  if (typeof managerData === 'object' && managerData !== null) {
    return {
      name: managerData.name || 'Unknown Manager',
      email: managerData.email || ''
    };
  }
  
  return {
    name: 'Manager',
    email: ''
  };
};

  const managerInfo = getManagerInfo();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={primaryImage}
          alt={property.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'Unknown'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.status === 'active' ? 'bg-green-100 text-green-800' :
            property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Active'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h3>
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{property.address}</span>
            </div>
            
            {/* Manager Information */}
            <div className="block text-sm font-medium text-gray-700 mb-1">
              Property Manager
            </div>
            {managerInfo ? (
              <div className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{managerInfo.name}</p>
                  {managerInfo.email && (
                    <p className="text-xs text-blue-600 truncate">{managerInfo.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-sm bg-gray-50 text-gray-500 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs">No manager assigned</span>
              </div>
            )}
          </div>
        </div>
     
        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{property.totalFlats || 0} Units</span>
          </div>
          
          {property.parkingSpaces && property.parkingSpaces > 0 && (
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{property.parkingSpaces} Parking</span>
            </div>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="mb-3">
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {commonAreas.length > 0 && (
          <div className="mb-4">
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Common Areas
            </div>
            <div className="flex flex-wrap gap-2">
              {commonAreas.slice(0, 3).map((area, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {area}
                </span>
              ))}
              {commonAreas.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{commonAreas.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-2">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <Button variant="secondary" size="sm" icon={<Home size={16} />} onClick={() => onManageUnits(property)}>
              Units
            </Button>
          </div>
          <div className="flex space-x-2 items-center">
            <Button variant="secondary" size="sm" icon={<Edit2 size={16} />} onClick={() => onEdit(property)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => onDelete(property.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;