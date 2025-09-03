import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowUpDown, Users } from 'lucide-react';
import { PropertyPerformanceItem, PropertyPerformanceResponse } from '../../components/reportComp/types';


interface PropertyPerformanceTableProps {
  propertyPerformance?: PropertyPerformanceResponse;
  onPropertyClick: (property: PropertyPerformanceItem) => void;
}

const PropertyPerformanceTable: React.FC<PropertyPerformanceTableProps> = ({
  propertyPerformance,
  onPropertyClick
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PropertyPerformanceItem['financials'];
    direction: 'asc' | 'desc';
  } | null>(null);

 
  const properties = useMemo(() => {
    return propertyPerformance?.data || [];
  }, [propertyPerformance?.data]); 

  console.log('Properties:', properties);
  const sortedProperties = useMemo(() => {
    if (!sortConfig) return properties;

    return [...properties].sort((a, b) => {
      const aValue = a.financials[sortConfig.key];
      const bValue = b.financials[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [properties, sortConfig]); // Now properties is stable

  const requestSort = (key: keyof PropertyPerformanceItem['financials']) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof PropertyPerformanceItem['financials']) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="ml-1 text-gray-400" />;
    }
    return (
      <ArrowUpDown
        size={16}
        className={`ml-1 ${
          sortConfig.direction === 'asc' ? 'text-blue-600 rotate-180' : 'text-blue-600'
        }`}
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin > 0) return 'text-green-600';
    if (margin < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card title="Property Performance">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('totalRevenue')}
                >
                  <div className="flex items-center">
                    Revenue
                    {getSortIcon('totalRevenue')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('totalExpenses')}
                >
                  <div className="flex items-center">
                    Expenses
                    {getSortIcon('totalExpenses')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('netIncome')}
                >
                  <div className="flex items-center">
                    Net Income
                    {getSortIcon('netIncome')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('profitMargin')}
                >
                  <div className="flex items-center">
                    Profit Margin
                    {getSortIcon('profitMargin')}
                  </div>
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProperties.length > 0 ? (
                sortedProperties.map((item) => (
                  <tr key={item.property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.property.name}</div>
                      <div className="text-xs text-gray-500">{item.property.address}</div>
                      <div className="text-xs text-gray-400">Flats: {item.property.totalFlats}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.financials.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.financials.totalExpenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getProfitMarginColor(item.financials.netIncome)}>
                        {formatCurrency(item.financials.netIncome)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getProfitMarginColor(item.financials.profitMargin)}>
                        {item.financials.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(item.property.occupancyRate, 100)}%` }}
                          />
                        </div>
                        {item.property.occupancyRate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.property.occupiedFlats}/{item.property.totalFlats} occupied
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-xs">
                        <span className="text-green-600">Payments: {item.counts.payments}</span>
                        <span className="mx-1">•</span>
                        <span className="text-red-600">Expenses: {item.counts.expenses}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Users size={16} />}
                        onClick={() => onPropertyClick(item)}
                        // disabled={item.property.occupiedFlats === 0}
                        title={item.property.occupiedFlats === 0 ? 'No tenants in this property' : 'View tenants'}
                      >
                        Tenants
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No property data available for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        {propertyPerformance?.summary && (
          <div className="mt-6 pt-6 border-t border-gray-200">
        
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{propertyPerformance.summary.totalProperties}</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(propertyPerformance.summary.totalRevenueAcrossProperties)}
                </div>
                <div className="text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(propertyPerformance.summary.totalExpensesAcrossProperties)}
                </div>
                <div className="text-gray-600">Total Expenses</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(propertyPerformance.summary.totalNetIncomeAcrossProperties)}
                </div>
                <div className="text-gray-600">Net Income</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">
                  {propertyPerformance.summary.averageOccupancyRate}%
                </div>
                <div className="text-gray-600">Avg Occupancy</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PropertyPerformanceTable;