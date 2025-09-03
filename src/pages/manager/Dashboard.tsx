import React from 'react';
import { Users, Home, CreditCard} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetManagerDashboardQuery } from '../../redux/services/managerApi';

const Building = (props: React.ComponentProps<typeof Home>) => {
  return <Home {...props} />;
};

const ManagerDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: response, isLoading, isError } = useGetManagerDashboardQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Failed to load dashboard data.</p>
        <Button 
          variant="primary" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const { data }: any = response;
  const { 
    propertyCounts = { houses: 0, flats: 0, tenants: 0 }, 
    paymentStats = { approved: 0, pending: 0, rejected: 0, total: 0 }, 
    expenseStats = { approved: 0, pending: 0, rejected: 0, total: 0 },
    recentActivity = { payments: [], expenses: [] } 
  } = data || {};

  const stats = [
    {
      id: 1,
      name: 'Properties Managed',
      value: propertyCounts.houses,
      icon: <Home className="h-7 w-7 text-blue-800" />,
      // link: '/manager/properties'
    },
    {
      id: 2,
      name: 'Total Units',
      value: propertyCounts.flats,
      icon: <Building className="h-7 w-7 text-green-600" />,
      // link: '/manager/properties'
    },
    {
      id: 3,
      name: 'Active Tenants',
      value: propertyCounts.tenants,
      icon: <Users className="h-7 w-7 text-purple-600" />,
      link: '/manager/tenants'
    },
    {
      id: 4,
      name: 'Total Payments',
      value: paymentStats.total,
      icon: <CreditCard className="h-7 w-7 text-yellow-600" />,
      link: '/manager/payments'
    },
  ];

 
  const recentExpenses = recentActivity.expenses
    ?.slice(0, 3)
    ?.map((expense: any) => ({
      id: expense?.id || '',
      description: expense?.description || 'Expense',
      amount: expense?.amount || 0,
      date: expense?.expenseDate || '',
      status: expense?.status?.toLowerCase() || 'pending',
      property: typeof expense?.houseId === 'object' ? expense.houseId?.name : ''
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Manager'}!</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="primary" size="sm">
            Quick Actions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link to={stat.link} key={stat.id}>
            <Card className="border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-gray-50">{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Payment Statistics">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Approved Payments</p>
              <p className="text-2xl font-semibold text-blue-800">
                {paymentStats.approved}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {paymentStats.pending}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-semibold text-green-600">
                {paymentStats.total}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Rejected Payments</p>
              <p className="text-2xl font-semibold text-red-600">
                {paymentStats.rejected}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Expense Statistics">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Approved Expenses</p>
              <p className="text-2xl font-semibold text-blue-800">
                {expenseStats.approved}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Pending Expenses</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {expenseStats.pending}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-green-600">
                {expenseStats.total}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Rejected Expenses</p>
              <p className="text-2xl font-semibold text-red-600">
                {expenseStats.rejected}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Payments">
          <div className="space-y-4">
            {recentActivity.payments?.slice(0, 3).map((payment: any) => (
              <div key={payment?.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                  <CreditCard size={16} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Payment {payment?.status === 'approved' ? 'received' : payment?.status} 
                  </p>
                  <p className="text-xs text-gray-500">
                    {payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''} · ₦{payment?.amount?.toLocaleString() || '0'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  payment?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  payment?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment?.status}
                </span>
              </div>
            ))}
            {recentActivity.payments?.length === 0 && (
              <div className="text-center text-gray-400 py-4">No recent payments</div>
            )}
          </div>
        </Card>

        <Card title="Recent Expenses">
          <div className="space-y-4  ">
            {recentActivity.expenses?.slice(0, 3).map((expense :any) => (
              <div key={expense?.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                  <span className="h-8 w-8 text-center">₦{expense?.amount?.toLocaleString() || '0'}</span>
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {expense?.description || 'Expense'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {expense?.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : ''} · ₦{expense?.amount?.toLocaleString() || '0'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  expense?.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                  expense?.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {expense?.status}
                </span>
              </div>
            ))}
            {recentActivity.expenses?.length === 0 && (
              <div className="text-center text-gray-400 py-4">No recent expenses</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;