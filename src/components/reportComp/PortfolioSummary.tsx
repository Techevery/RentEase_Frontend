import React from 'react';
import Card from '../../components/ui/Card';
import { PropertyPerformanceResponse } from '../../components/reportComp/types';

interface PortfolioSummaryProps {
  portfolioSummary?: PropertyPerformanceResponse['summary'];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolioSummary }) => {
  const defaultSummary = {
    totalProperties: 0,
    averageOccupancyRate: 0,
    totalRevenueAcrossProperties: 0,
    totalExpensesAcrossProperties: 0,
    totalNetIncomeAcrossProperties: 0
  };

  const summary = portfolioSummary || defaultSummary;

  return (
    <Card title="Portfolio Summary">
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.totalProperties}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              ₦{summary.totalRevenueAcrossProperties.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              ₦{summary.totalExpensesAcrossProperties.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              ₦{summary.totalNetIncomeAcrossProperties.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Net Income</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioSummary;