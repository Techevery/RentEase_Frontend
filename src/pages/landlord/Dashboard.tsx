import React from 'react';
import { Users, Home as HomeIcon, Building, UserCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetDashboardStatsQuery } from '../../redux/services/landlordApi';
import { Payment, Expense } from '../../types/index';

const LandlordDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
const { data: apiResponse, isLoading, isError } = useGetDashboardStatsQuery();
const data = apiResponse?.data;




  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }
  if (isError || !data) {
    return <div className="p-8 text-center text-red-600">Failed to load dashboard data.</div>;
  }


const payments: Payment[] = data.recentActivity?.payments ?? [];
const expenses: Expense[] = data.recentActivity?.expenses ?? [];

  // Property counts
  const totalProperties = (data.propertyCounts?.houses ?? 0);
  const totalUnits = data.propertyCounts?.flats ?? 0;
  const totalTenants = data.propertyCounts?.tenants ?? 0;
  const totalManagers = data.propertyCounts?.managers ?? 0;

  // Financial overview
  // const totalRevenue = data.financialOverview?.currentMonth?.income ?? 0;
  // const totalExpenses = data.financialOverview?.currentMonth?.expenses ?? 0;
  // const netIncome = data.financialOverview?.currentMonth?.netIncome ?? 0;
  // const incomeCollectedPercent = totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + totalExpenses)) * 100) : 0;
  // const expensesSpentPercent = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;
  // const netIncomePercent = totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0;

  // Recent activity
  // const payments = data.recentActivity?.payments ?? [];
  // const expenses = data.recentActivity?.expenses ?? [];

  const stats = [
    {
      id: 1,
      name: 'Total Properties',
      value: totalProperties,
      icon: <Building className="h-7 w-7 text-blue-800" />,
      path: '/landlord/properties',
    },
    {
      id: 2,
      name: 'Total Units',
      value: totalUnits,
      icon: <HomeIcon className="h-7 w-7 text-green-600" />,
      path: '/landlord/properties',
    },
    {
      id: 3,
      name: 'Total Tenants',
      value: totalTenants,
      icon: <Users className="h-7 w-7 text-purple-600" />,
      path: '/landlord/tenants',
    },
    {
      id: 4,
      name: 'Managers',
      value: totalManagers,
      icon: <UserCheck className="h-7 w-7 text-teal-600" />,
      path: '/landlord/managers',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link to={stat.path} key={stat.id} className="transition-transform hover:scale-105">
            <Card className="border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gray-50">{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card title="Recent Payments">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-400">No recent payments</td>
                  </tr>
                ) : (
                  payments.map((payment: Payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.tenantId?.name || payment.tenantId?.id || payment.tenantId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">  {payment.houseId?.name || payment.houseId} - 
  {payment.unitId?.name || payment.unitId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₦{payment.amount}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link to="/landlord/payments" className="text-sm font-medium text-blue-800 hover:text-blue-700">
              View all payments →
            </Link>
          </div>
        </Card>

        {/* Recent Expenses */}
        <Card title="Recent Expenses">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-400">No recent expenses</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900"> {expense.houseId?.name || expense.houseId}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{expense.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₦{expense.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link to="/landlord/expenses" className="text-sm font-medium text-blue-800 hover:text-blue-700">
              View all expenses →
            </Link>
          </div>
        </Card>
      </div>

      {/* Financial Overview
      <Card title="Financial Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-800" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-semibold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-800" style={{ width: `${incomeCollectedPercent}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{incomeCollectedPercent}% of expected income collected</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <span className='h-8 w-8 text-green-900'>(₦)</span>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">₦{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${expensesSpentPercent}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{expensesSpentPercent}% of monthly budget spent</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <span className='h-11 w-11 text-green-900'>(₦)</span>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-semibold text-gray-900">₦{netIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${netIncomePercent}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">{netIncomePercent}% profit margin</p>
            </div>
          </div>
        </div>
      </Card> */}
    </div>
  );
};

export default LandlordDashboard;
