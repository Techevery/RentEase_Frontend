import React, { useState } from 'react';
import Card from '../../components/ui/Card';

import { 
  useGetPropertyPerformanceQuery,
  useGetFinancialSummaryQuery,

  useGetExpensesBreakdownQuery
} from '../../redux/services/reportApi';
import FinancialOverview from '../../components/reportComp/FinancialOverview';
import PropertyPerformanceTable from '../../components/reportComp/PropertyPerformanceTable';
// import PortfolioSummary from '../../components/reportComp/PortfolioSummary';
import ExpensesBreakdown from '../../components/reportComp/ExpensesBreakdown';
import PropertyTenantsModal from '../../components/reportComp/Modals/PropertyTenantsModal';
import TenantProfileModal from '../../components/reportComp/Modals/TenantProfileModal';
import PaymentHistoryModal from '../../components/reportComp/Modals/PaymentHistoryModal';
import { PropertyPerformanceItem } from '../../components/reportComp/types';

const LandlordReports: React.FC = () => {
   const currentYear = new Date().getFullYear();
  const [dateRange, setDateRange] = useState({
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`
  });

  // Modal states
  const [selectedProperty, setSelectedProperty] = useState<PropertyPerformanceItem | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [showTenantsModal, setShowTenantsModal] = useState(false);
  const [showTenantProfile, setShowTenantProfile] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Fetch reports data from API
  const { 
    data: propertyData, 
    isLoading: isLoadingProperties,
    error: propertyError 
  } = useGetPropertyPerformanceQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
    
  });
  console.log('Property Data:', propertyData);

  const { 
    data: financialData, 
    isLoading: isLoadingFinancial,
    error: financialError 
  } = useGetFinancialSummaryQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });
  console.log('Financial Data:', financialData);
  const { 
    data: expensesData, 
    isLoading: isLoadingExpenses,
    error: expensesError 
  } = useGetExpensesBreakdownQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

 

  // Modal handlers
  const handlePropertyClick = (property: PropertyPerformanceItem) => {
    setSelectedProperty(property);
    setShowTenantsModal(true);
  };

  const handleTenantClick = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setShowTenantsModal(false);
    setShowTenantProfile(true);
  };

  const handleViewPayments = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setShowTenantProfile(false);
    setShowPaymentHistory(true);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isLoading = isLoadingProperties || isLoadingFinancial || isLoadingExpenses;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  // Check for errors
  if (propertyError || financialError || expensesError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error Loading Reports
          </div>
          <p className="text-gray-600">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Performance Reports</h1>
          <p className="text-gray-600">Comprehensive analysis of your property portfolio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm w-full sm:w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm w-full sm:w-32"
              />
            </div>
          </div>

       
        </div>
      </div>

      {/* Financial Overview */}
      <FinancialOverview financialOverview={financialData?.data?.summary} />
      
      {/* Property Performance Table */}
      <PropertyPerformanceTable
        propertyPerformance={propertyData}
        onPropertyClick={handlePropertyClick}
      />

      {/* Portfolio Summary */}
      {/* {propertyData && (
        <PortfolioSummary portfolioSummary={propertyData?.summary} />
      )} */}

      {/* Expenses Breakdown */}
      <ExpensesBreakdown expensesData={expensesData?.data} />

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {propertyData?.summary.totalProperties || 0}
            </div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₦{(financialData?.data?.summary?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              ₦{(financialData?.data?.summary?.totalExpenses || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {propertyData?.summary.averageOccupancyRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Occupancy</div>
          </div>
        </Card>
      </div>

      {/* Date Range Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-800">Report Period</h4>
            <p className="text-sm text-blue-700">
              {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PropertyTenantsModal
        property={selectedProperty}
        isOpen={showTenantsModal}
        onClose={() => setShowTenantsModal(false)}
        onTenantClick={handleTenantClick}
      />

      <TenantProfileModal
        tenantId={selectedTenantId}
        isOpen={showTenantProfile}
        onClose={() => setShowTenantProfile(false)}
        onViewPayments={handleViewPayments}
      />

      <PaymentHistoryModal
        tenantId={selectedTenantId}
        isOpen={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
      />
    </div>
  );
};

export default LandlordReports;