import React, { useState } from 'react';
import { Search, Filter, Upload, Download, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
} from '../../redux/services/expenseApi';
import {
  useGetManagedPropertiesQuery,
} from '../../redux/services/managerApi';

// Expense type based on backend response
interface BackendExpense {
  _id: string;
  amount: number;
  expenseDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: string;
  description: string;
  vendor: string;
  documentUrl?: string;
  houseId: { _id: string; name: string };
  flatId?: { _id: string; number: string };
  managerId?: { name: string };
  rejectionReason?: string;
}


interface Expense {
  id: string;
  amount: number;
  date: string;
  status: string;
  category: string;
  description: string;
  vendor: string;
  property: string;
  propertyId: string;
  unitId?: string; 
  unit?: string;
  documentUrl?: string;
  rejectionReason?: string;
  manager?: string;
}

const transformExpense = (expense: BackendExpense): Expense => ({
  id: expense._id,
  amount: expense.amount,
  date: expense.expenseDate,
  propertyId: expense.houseId?._id || '',
  unitId: expense.flatId?._id,
  status: expense.status,
  category: expense.category,
  description: expense.description,
  vendor: expense.vendor,
  property: expense.houseId?.name || 'No Property Assigned',
  unit: expense.flatId?.number,
  documentUrl: expense.documentUrl,
  rejectionReason: expense.rejectionReason,
  manager: expense.managerId?.name,
});

const UploadExpenseModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
  properties: any[];
}> = ({ open, onClose, onSubmit, loading, properties }) => {
  const [form, setForm] = useState({
    houseId: '',
    flatId: '',
    category: '',
    description: '',
    vendor: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    document: null as File | null,
  });
  
  const [documentUrl, setDocumentUrl] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({
        ...prev,
        document: file,
      }));
      setDocumentUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'document' && value instanceof File) {
          formData.append('document', value);
        } else if (key !== 'document') {
          formData.append(key, value.toString());
        }
      }
    });
    
    onSubmit(formData);
    onClose();
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Upload Expense</h2>
        <form className="space-y-4 scroll-m-0" onSubmit={handleSubmit}>
          <select
            name="houseId"
            value={form.houseId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Property</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.name}
              </option>
            ))}
          </select>
          
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            <option value="maintenance">Maintenance</option>
            <option value="utilities">Utilities</option>
            <option value="taxes">Taxes</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
          
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            name="vendor"
            placeholder="Vendor"
            value={form.vendor}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <input
            name="expenseDate"
            type="date"
            value={form.expenseDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          
          <div>
            <label className="block text-sm mb-1">Upload Document (Optional)</label>
            <input
              name="document"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full"
            />
            {documentUrl && (
              <div className="mt-2">
                <a 
                  href={documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Preview Document
                </a>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagerExpenses: React.FC = () => {
  const { data: expensesData, isLoading: isLoadingExpenses, isError: isExpensesError } = useGetExpensesQuery({}, { refetchOnMountOrArgChange: true, refetchOnReconnect: true, pollingInterval: 10000 });
  const [createExpense, { isLoading: isUploading }] = useCreateExpenseMutation();
  const [showUpload, setShowUpload] = useState(false);
  
  // Fetch properties with proper loading and error states
  const { 
     data: propertiesData, 
     isLoading: isLoadingProperties, 
     isError: isPropertiesError,
   } = useGetManagedPropertiesQuery(undefined, { 
     refetchOnMountOrArgChange: true, 
     refetchOnReconnect: true, 
     pollingInterval: 10000 
   });

  if (isLoadingProperties || isLoadingExpenses) {
    return <div className="p-8 text-center">Loading data...</div>;
  }

  if (isPropertiesError) {
  
    return <div className="p-8 text-center text-red-600">Failed to load properties. Please try again.</div>;
  }

  if (isExpensesError) {
    return <div className="p-8 text-center text-red-600">Failed to load expenses.</div>;
  }

  const properties = propertiesData?.data?.properties || [];
  const expenses: Expense[] = expensesData?.data?.map(transformExpense) || [];

  const handleExport = () => {
    const csvRows = [
      [
        'Property',
        'Unit',
        'Category',
        'Description',
        'Vendor',
        'Amount',
        'Date',
        'Status',
      ].join(','),
      ...expenses.map((e) =>
        [
          `"${e.property}"`,
          e.unit ? `"${e.unit}"` : '',
          `"${e.category}"`,
          `"${e.description}"`,
          `"${e.vendor}"`,
          e.amount,
          e.date,
          `"${e.status}"`,
        ].join(',')
      ),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'expenses.csv');
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Upload and track property expenses</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={<Download size={20} />} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Upload size={20} />}
            onClick={() => setShowUpload(true)}
            // disabled={isLoadingProperties || properties.length === 0}
          >
            Upload Expense
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1">
              <Input
                id="search"
                name="search"
                type="text"
                placeholder="Search expenses..."
                value=""
                onChange={() => {}}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex space-x-3">
              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>All Properties</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>All Categories</option>
                <option>maintenance</option>
                <option>utilities</option>
                <option>taxes</option>
                <option>insurance</option>
                <option>other</option>
              </select>
              <Button variant="outline" icon={<Filter size={18} />}>
                More Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.property} {expense.unit && `- ${expense.unit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        ₦{expense.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`badge ${
  expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
  expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
}`}>
  {expense.status}
</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <p className="text-sm text-gray-500">Showing {expenses.length} expenses</p>
          </div>
        </div>
      </Card>

      <UploadExpenseModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={async (formData) => {
          await createExpense(formData);
        }}
        loading={isUploading}
        properties={properties}
      />
    </div>
  );
};

export default ManagerExpenses;