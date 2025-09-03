import React from 'react';
import Card from '../../components/ui/Card';
import { TrendingUp, BarChart2, PieChart, Users } from 'lucide-react';
import { FinancialSummary } from '../../components/reportComp/types';

interface FinancialOverviewProps {
  financialOverview?: FinancialSummary['summary'];
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ financialOverview }) => {
  const defaultOverview = {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    profitMargin: 0
  };

  const overview = financialOverview || defaultOverview;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₦{overview.totalRevenue.toLocaleString()}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
            <BarChart2 className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₦{overview.totalExpenses.toLocaleString()}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Net Income</h3>
            <PieChart className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₦{overview.netIncome.toLocaleString()}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Profit Margin</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {overview.profitMargin.toFixed(1)}%
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FinancialOverview;