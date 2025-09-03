import React from 'react';
import Card from '../../components/ui/Card';
import { ExpensesBreakdownResponse } from '../../components/reportComp/types';

interface ExpensesBreakdownProps {
  expensesData?: ExpensesBreakdownResponse;
}

const ExpensesBreakdown: React.FC<ExpensesBreakdownProps> = ({ expensesData }) => {
  if (!expensesData) {
    return (
      <Card title="Expenses Breakdown">
        <div className="p-6">
          <p className="text-gray-500 text-center">No expense data available</p>
        </div>
      </Card>
    );
  }

  const { summary, categoryBreakdown, monthlyBreakdown } = expensesData;
  const totalExpensesByCategory = Object.values(categoryBreakdown).reduce(
    (sum, category) => sum + category.totalAmount, 0
  );

  // Get last 6 months of data for the chart
  const lastSixMonths = Object.entries(monthlyBreakdown)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse();

  // Get top 5 categories by amount
  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  return (
    <Card title="Expenses Breakdown">
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Total Expenses</h4>
            <p className="text-2xl font-bold text-blue-900">
              ₦{summary.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700">{summary.totalExpenses} transactions</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Average Expense</h4>
            <p className="text-2xl font-bold text-green-900">
              ₦{summary.averageExpense.toLocaleString()}
            </p>
            <p className="text-sm text-green-700">per transaction</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Categories</h4>
            <p className="text-2xl font-bold text-purple-900">
              {Object.keys(categoryBreakdown).length}
            </p>
            <p className="text-sm text-purple-700">expense categories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">By Category</h4>
            <div className="space-y-4">
              {topCategories.map(([category, data]) => (
                <div key={category}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600 capitalize">{category}</span>
                    <span className="font-medium text-gray-900">
                      ₦{data.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{data.count} transactions</span>
                    <span>•</span>
                    <span>Avg: ₦{data.averageAmount.toLocaleString()}</span>
                    <span>•</span>
                    <span>{data.percentage.toFixed(1)}% of total</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ 
                        width: `${data.percentage}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {Object.keys(categoryBreakdown).length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">
                    +{Object.keys(categoryBreakdown).length - 5} more categories
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Trend */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend (Last 6 Months)</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-48 flex items-end justify-between gap-2">
                {lastSixMonths.map(([month, data]) => {
                  const maxAmount = Math.max(...lastSixMonths.map(([, monthData]) => monthData.totalAmount), 1);
                  const heightPercentage = (data.totalAmount / maxAmount) * 100;
                  
                  return (
                    <div key={month} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-t"
                        style={{
                          height: `${heightPercentage}%`,
                        }}
                        title={`₦${data.totalAmount.toLocaleString()}`}
                      />
                      <span className="text-xs text-gray-600 mt-2">
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        ₦{(data.totalAmount / 1000).toFixed(0)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Category Legend */}
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Top Categories</h5>
              <div className="flex flex-wrap gap-2">
                {topCategories.slice(0, 3).map(([category]) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                  </span>
                ))}
                {topCategories.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{topCategories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{summary.totalExpenses}</div>
              <div className="text-gray-600">Total Expenses</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(categoryBreakdown).length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(monthlyBreakdown).length}
              </div>
              <div className="text-gray-600">Months</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ₦{summary.averageExpense.toLocaleString()}
              </div>
              <div className="text-gray-600">Average</div>
            </div>
          </div>
        </div>

        {/* Filters Info */}
        {expensesData.filters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Filters Applied</h5>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                Period: {expensesData.filters.fromDate || 'Start'} to {expensesData.filters.toDate || 'End'}
              </span>
              {expensesData.filters.propertyId && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  Property: {expensesData.filters.propertyId}
                </span>
              )}
            </div>
          </div>
        )}

        {expensesData.warnings && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{expensesData.warnings}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExpensesBreakdown;