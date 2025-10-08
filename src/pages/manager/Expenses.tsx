import React, { useState, useEffect } from 'react';
import { Search, Filter, Upload, Download, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  next?: { page: number; limit: number };
  prev?: { page: number; limit: number };
}

interface ExpensesResponse {
  success: boolean;
  count: number;
  pagination: PaginationInfo;
  data: BackendExpense[];
}

// Filter state interface
interface FilterState {
  search: string;
  propertyId: string;
  category: string;
  status: string;
  fromDate: string;
  toDate: string;
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
    // Reset form after submission
    setForm({
      houseId: '',
      flatId: '',
      category: '',
      description: '',
      vendor: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      document: null,
    });
    setDocumentUrl('');
  };

  const handleClose = () => {
    // Reset form when closing
    setForm({
      houseId: '',
      flatId: '',
      category: '',
      description: '',
      vendor: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      document: null,
    });
    setDocumentUrl('');
    onClose();
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={handleClose}
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
            <Button type="button" variant="secondary" onClick={handleClose}>
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

const PaginationControls: React.FC<{
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}> = ({ pagination, onPageChange, onLimitChange }) => {
  const { currentPage, totalPages, total } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 px-6 py-4 border-t">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Showing page {currentPage} of {totalPages}
        </span>
        <span className="text-sm text-gray-500">•</span>
        <span className="text-sm text-gray-700">
          Total {total} expenses
        </span>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            onChange={(e) => onLimitChange(Number(e.target.value))}
            defaultValue="10"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsLeft size={16} />
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[2rem] px-2 py-1 text-sm rounded border ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagerExpenses: React.FC = () => {
  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    propertyId: '',
    category: '',
    status: '',
    fromDate: '',
    toDate: '',
  });

  // Fetch all expenses by setting a large limit
  const { 
    data: expensesResponse, 
    isLoading: isLoadingExpenses, 
    isError: isExpensesError,
    refetch 
  } = useGetExpensesQuery({
    page: 1,
    limit: 1000, // Fetch a large number to get all expenses
  }, { 
    refetchOnMountOrArgChange: true,
  });

  const [createExpense, { isLoading: isUploading }] = useCreateExpenseMutation();
  const [showUpload, setShowUpload] = useState(false);
  
  // Fetch properties
  const { 
    data: propertiesData, 
    isLoading: isLoadingProperties, 
    isError: isPropertiesError,
  } = useGetManagedPropertiesQuery(undefined, { 
    refetchOnMountOrArgChange: true, 
  });

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);

  // Pagination state for displayed results
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Process expenses data
  useEffect(() => {
    if (expensesResponse) {
      const expensesData = expensesResponse as ExpensesResponse;
      const backendExpenses = expensesData?.data || [];
      const transformedExpenses = backendExpenses.map(transformExpense);
      
      setAllExpenses(transformedExpenses);
      setFilteredExpenses(transformedExpenses);
    }
  }, [expensesResponse]);

  // Apply filters whenever search term, property, status, or expenses change
  useEffect(() => {
    let result = [...allExpenses];
    
    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.vendor.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.property.toLowerCase().includes(term) ||
        expense.amount.toString().includes(term)
      );
    }
    
    // Apply property filter
    if (filters.propertyId) {
      result = result.filter(expense => expense.propertyId === filters.propertyId);
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(expense => expense.category === filters.category);
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(expense => expense.status === filters.status);
    }
    
    // Apply date filters
    if (filters.fromDate) {
      result = result.filter(expense => expense.date >= filters.fromDate);
    }
    
    if (filters.toDate) {
      result = result.filter(expense => expense.date <= filters.toDate);
    }
    
    setFilteredExpenses(result);
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));
  }, [filters, allExpenses]);

  // Update displayed expenses based on current pagination
  useEffect(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    setDisplayedExpenses(filteredExpenses.slice(startIndex, endIndex));
  }, [filteredExpenses, pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newLimit,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / newLimit)
    }));
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyId: '',
      category: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
  };

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
      ...filteredExpenses.map((e) =>
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadExpense = async (formData: FormData) => {
    try {
      await createExpense(formData).unwrap();
      setShowUpload(false);
      refetch();
    } catch (error) {
      console.error('Failed to upload expense:', error);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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
          >
            Upload Expense
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 mb-6">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                id="search"
                name="search"
                type="text"
                placeholder="Search expenses by description or vendor..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon={<Search size={18} />}
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={filters.propertyId}
                onChange={(e) => handleFilterChange('propertyId', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Properties</option>
                {properties.map((property: any) => (
                  <option key={property._id} value={property._id}>
                    {property.name}
                  </option>
                ))}
              </select>
              
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="taxes">Taxes</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>

              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="From Date"
                />
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="To Date"
                />
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Expenses Table */}
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
                {displayedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  displayedExpenses.map((expense) => (
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
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ₦{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          expense.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredExpenses.length > 0 && (
            <PaginationControls
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                total: pagination.totalItems,
                hasNext: pagination.currentPage < pagination.totalPages,
                hasPrev: pagination.currentPage > 1
              }}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </div>
      </Card>

      {/* Upload Expense Modal */}
      <UploadExpenseModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUploadExpense}
        loading={isUploading}
        properties={properties}
      />
    </div>
  );
};

export default ManagerExpenses;