import React, { useState } from 'react';
import { useGetManagedPropertiesQuery } from '../../redux/services/managerApi';
import { useGetTenantPaymentSummaryQuery } from '../../redux/services/paymentApi';
import TenantDetailsModal from '../../components/managers/TenantDetailModal'; 
import UnitDetailsModal from '../../components/managers/UnitDetailsModal';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  HomeIcon,
  Building,
  User,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';

// Define TypeScript interfaces for the API response data
interface Tenant {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  rentAmount?: number;
  leaseStart?: string;
  leaseEnd?: string;
  status?: string;
}

interface Flat {
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

interface PropertyStats {
  occupied?: number;
  totalFlats?: number;
}

interface Property {
  _id: string;
  name: string;
  address: string;
  status: string;
  stats?: PropertyStats;
  flats?: Flat[];
}

interface ManagedPropertiesResponse {
  data: {
    properties: Property[];
  };
}



const PropertiesList = () => {
  const { data: response, isLoading, error } = useGetManagedPropertiesQuery();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Flat | null>(null);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
 
  // Fetch tenant payment summary when a tenant is selected
  const { data: tenantPaymentSummary } = useGetTenantPaymentSummaryQuery(
    selectedTenantId!, 
    { skip: !selectedTenantId }
  );


  const handleTenantClick = (tenantId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedTenantId(tenantId);
    setTenantModalOpen(true);
  };

  const handleUnitClick = (unit: Flat, property: Property) => {
    setSelectedUnit({
      ...unit,
      property: {
        name: property.name,
        address: property.address
      }
    });
    setUnitModalOpen(true);
  };

  const handleCloseTenantModal = () => {
    setTenantModalOpen(false);
    setSelectedTenantId(null);
  };

  const handleCloseUnitModal = () => {
    setUnitModalOpen(false);
    setSelectedUnit(null);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTenantData = (apiData: any) => {
    if (!apiData) return null;

    return {
      tenant: apiData.tenant ? {
        id: apiData.tenant.id,
        name: apiData.tenant.name,
        email: apiData.tenant.email,
        phone: apiData.tenant.phone,
        emergencyContact: apiData.tenant.emergencyContact,
        rentAmount: apiData.tenant.rentAmount,
        leaseStart: apiData.tenant.leaseStart,
        leaseEnd: apiData.tenant.leaseEnd,
        status: apiData.tenant.status,
        property: apiData.tenant.property?.name || 'N/A',
        propertyAddress: apiData.tenant.property?.address || 'N/A',
        unit: apiData.tenant.unit?.number || 'N/A'
      } : undefined,
      summary: apiData.summary,
      paymentMethodBreakdown: apiData.paymentMethodBreakdown,
      monthlyBreakdown: apiData.monthlyBreakdown,
      recentActivity: apiData.recentActivity,
      allPayments: apiData.allPayments
    };
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-60vh">
      <LoadingSpinner size="lg" text="Loading properties..." />
    </div>
  );
  
  if (error) return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      Error loading properties. Please try again later.
    </div>
  );
  
  if (!response) return (
    <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
      No properties data available
    </div>
  );

  const properties = (response as ManagedPropertiesResponse).data.properties || [];

  return (
    <div className="mb-8 px-4 md:px-8">
      <div className="flex items-center gap-2 mb-6">
        <HomeIcon className="w-8 h-8 text-blue-800" />
        <h1 className="text-3xl font-semibold text-blue-900">
          Tenant Management
        </h1>
      </div>

      {properties.length === 0 && (
        <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">
            No properties found in your portfolio
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const occupiedCount = property.stats?.occupied || 0;
          const totalFlats = property.stats?.totalFlats || 0;
          
          return (
            <Card
              key={property._id}

              className="h-full flex flex-col border border-gray-200 rounded-lg transition-transform duration-200 hover:translate-y-[-4px] hover:shadow-lg"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                      <HomeIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {property.name}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                    property.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status || "active"}
                  </span>
                </div>
          }
              footer={
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{property.address}</span>
                  </div>
                </div>
              }
            >
              <div className="p-6 flex-grow">
                {/* Property Stats */}
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-blue-600">{totalFlats}</div>
                    <div className="text-sm text-gray-600">Total Units</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-green-600">{occupiedCount}</div>
                    <div className="text-sm text-gray-600">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-blue-400">{totalFlats - occupiedCount}</div>
                    <div className="text-sm text-gray-600">Vacant</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-gray-700" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Unit Details ({property.flats?.length || 0})
                  </h4>
                </div>

                {!property.flats || property.flats.length === 0 ? (
                  <div className="p-4 text-center border border-gray-200 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      No units available in this property
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-auto">
                    {property.flats.map((flat) => (
                      <div key={flat._id}>
                        <div 
                          className={`p-3 rounded-lg mb-2 cursor-pointer ${
                            flat.status === 'occupied' 
                              ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          } transition-colors`}
                          onClick={() => handleUnitClick(flat, property)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                {flat.number}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Unit {flat.number}</div>
                                {flat.tenant ? (
                                  <button
                                    onClick={(e) => handleTenantClick(flat.tenant!._id, e)}
                                    className="text-sm text-gray-600 hover:text-blue-600 hover:underline cursor-pointer"
                                  >
                                    {flat.tenant.name}
                                  </button>
                                ) : (
                                  <div className="text-sm text-gray-600">Vacant</div>
                                )}
                              </div>
                            </div>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              flat.status === 'occupied'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {flat.status === 'occupied' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {flat.status?.toUpperCase() || 'VACANT'}
                            </span>
                          </div>
                        </div>
                        
                        {flat.tenant && (
                          <div 
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={(e) => handleTenantClick(flat.tenant!._id, e)}
                          >
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-3">
                                <User className="w-3 h-3" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {flat.tenant.name}
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                  {flat.tenant.phone}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                 
                                  <span>₦{flat.tenant.rentAmount?.toLocaleString() || '0'} /Yr</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tenant Details Modal */}
      <TenantDetailsModal 
        open={tenantModalOpen}
        onClose={handleCloseTenantModal}
        tenantData={transformTenantData(tenantPaymentSummary?.data)} 
      />

      {/* Unit Details Modal */}
      <UnitDetailsModal
        isOpen={unitModalOpen}
        onClose={handleCloseUnitModal}
        unitData={selectedUnit}
      />
    </div>
  );
};

export default PropertiesList;