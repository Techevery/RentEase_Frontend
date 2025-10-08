import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Trash2, Eye, X, Building, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useApproveExpenseMutation,
  useRejectExpenseMutation,
} from '../../redux/services/expenseApi';
import { useGetHousesQuery } from '../../redux/services/propertyApi';

interface BackendExpense {
  _id: string; 
  amount: number;
  expenseDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  category: string;
  description: string;
  vendor: string;
  documentUrl?: string;
  houseId: { name: string };
  flatId?: { number: string };
  managerId?: { name: string };
  rejectionReason?: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  category: string;
  description: string;
  vendor: string;
  property: string;
  unit?: string;
  documentUrl?: string;
  rejectionReason?: string;
  manager?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  success: boolean;
  data: BackendExpense[];
  count: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
    currentPage?: number;
    totalPages?: number;
  };
}

const transformExpense = (expense: BackendExpense): Expense => ({
  id: expense._id,
  amount: expense.amount,
  date: expense.expenseDate.split('T')[0],
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

// Add Property Filter Modal Component
const PropertyFilterModal: React.FC<{
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any[];
  selectedProperty: string | null;
  onSelectProperty: (propertyId: string | null) => void;
}> = ({ open, onClose, properties, selectedProperty, onSelectProperty }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Select Property</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-2">
            <button
              className={`w-full text-left p-3 rounded-lg border ${
                selectedProperty === null 
                  ? 'bg-blue-50 border-blue-500' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onSelectProperty(null)}
            >
              All Properties
            </button>
            
            {properties.map((property) => (
              <button
                key={property._id}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedProperty === property._id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onSelectProperty(property._id)}
              >
                {property.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const UploadExpenseModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

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
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
      setDocumentUrl(URL.createObjectURL(file));
    } else {
        setForm((prev) => ({ ...prev, document: null }));
        if (documentUrl) {
            URL.revokeObjectURL(documentUrl);
        }
        setDocumentUrl('');
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
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Upload Expense</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <form id="upload-expense-form" className="space-y-4" onSubmit={handleSubmit}>
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
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 flex-shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="upload-expense-form" variant="primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExpenseForm: React.FC<{
  initial?: Partial<Expense>;
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any[];
}> = ({ initial = {}, onSubmit, onClose, properties }) => {
  const [form, setForm] = useState<Omit<Expense, 'id'>>({
    property: initial.property || '',
    category: initial.category || 'maintenance',
    description: initial.description || '',
    vendor: initial.vendor || '',
    amount: initial.amount || 0,
    date: initial.date || '',
    status: initial.status || 'Pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">{initial.id ? 'Edit' : 'Add'} Expense</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <form
            id="expense-form"
            onSubmit={e => {
              e.preventDefault();
              onSubmit(form);
            }}
            className="space-y-4"
          >
            <select
              name="property"
              value={form.property}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              title="Select property"
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property._id} value={property.name}>
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
              title="Select expense category"
            >
              <option value="">Select category</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Utilities</option>
              <option value="taxes">Taxes</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
            <input
              name="description"
              placeholder="Description"
              title="Enter a short description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="vendor"
              placeholder="Vendor"
              title="Enter the vendor name"
              value={form.vendor}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="amount"
              placeholder="Amount"
              title="Enter the expense amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="number"
              min={0}
              required
            />
            <input
              name="date"
              placeholder="Date"
              title="Select the expense date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              type="date"
              required
            />
          </form>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 flex-shrink-0">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" variant="primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{ open: boolean; onConfirm: () => void; onCancel: () => void }> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Delete Expense</h2>
        <p className="mb-6 text-center text-gray-700">Are you sure you want to delete this expense?</p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExpenseDetailsModal: React.FC<{ 
  expense: Expense | null; 
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
}> = ({ expense, onClose, onApprove, onReject, loading }) => {
  if (!expense) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Expense Details</h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm">
          <div><strong>Property:</strong> {expense.property}</div>
          {expense.unit && <div><strong>Unit:</strong> {expense.unit}</div>}
          <div><strong>Category:</strong> {expense.category}</div>
          <div><strong>Description:</strong> {expense.description}</div>
          <div><strong>Vendor:</strong> {expense.vendor}</div>
          <div><strong>Amount:</strong> ₦{expense.amount.toLocaleString()}</div>
          <div><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</div>
          <div><strong>Status:</strong> 
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
              expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
            </span>
          </div>
          {expense.manager && <div><strong>Manager:</strong> {expense.manager}</div>}
          {expense.rejectionReason && <div><strong>Rejection Reason:</strong> {expense.rejectionReason}</div>}
          {expense.documentUrl && (
            <div>
              <strong>Document:</strong>
               <div className="mt-2">
                {expense.documentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img 
                    src={expense.documentUrl} 
                    alt="Expense document" 
                    className="max-w-full h-auto rounded border"
                  />
                ) : (
                  <a 
                    href={expense.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Document
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0 space-x-2">
          {expense.status === 'Pending' && (
            <>
              <Button 
                variant="success" 
                onClick={() => onApprove?.(expense.id)} 
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? 'Approving...' : 'Approve'}
              </Button>
              <Button 
                variant="danger" 
                onClick={() => onReject?.(expense.id)}
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

const LandlordExpenses: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Fetch all expenses by setting a large limit
  const { data, isLoading, isError, refetch } = useGetExpensesQuery({ 
    page: 1, 
    limit: 1000 // Fetch a large number to get all expenses
  }, {
    refetchOnMountOrArgChange: true,
  });
  
  const [createExpense, { isLoading: isUploading }] = useCreateExpenseMutation();
  const [updateExpense] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [approveExpense] = useApproveExpenseMutation();
  const [rejectExpense] = useRejectExpenseMutation();
  
  const { data: propertiesData } = useGetHousesQuery({});
  const properties = propertiesData?.data || [];

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsExpense, setDetailsExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination state for displayed results
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Process expenses data
  useEffect(() => {
    if (data) {
      const apiResponse = data as ApiResponse;
      const backendExpenses = apiResponse?.data || [];
      const transformedExpenses = backendExpenses.map(transformExpense);
      
      setAllExpenses(transformedExpenses);
      setFilteredExpenses(transformedExpenses);
    }
  }, [data]);

  // Filter expenses when filters change
  useEffect(() => {
    let result = [...allExpenses];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(expense => 
        expense.property.toLowerCase().includes(term) ||
        expense.description.toLowerCase().includes(term) ||
        expense.vendor.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.amount.toString().includes(term)
      );
    }
    
    // Apply property filter
    if (selectedProperty) {
      const property = properties.find((p: { _id: string; }) => p._id === selectedProperty);
      if (property) {
        result = result.filter(expense => expense.property === property.name);
      }
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(expense => expense.category === selectedCategory);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(expense => expense.status.toLowerCase() === selectedStatus);
    }
    
    setFilteredExpenses(result);
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage)
    }));
  }, [searchTerm, selectedProperty, selectedCategory, selectedStatus, allExpenses, properties]);

  // Update displayed expenses based on current pagination
  useEffect(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    setDisplayedExpenses(filteredExpenses.slice(startIndex, endIndex));
  }, [filteredExpenses, pagination.currentPage, pagination.itemsPerPage]);

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
        'Manager',
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
          e.manager ? `"${e.manager}"` : '',
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

  const handleAdd = () => {
    setShowUpload(true);
  };

  const handlePropertyFilter = () => {
    setShowPropertyFilter(true);
  };

  const handleSelectProperty = (propertyId: string | null) => {
    setSelectedProperty(propertyId);
    setShowPropertyFilter(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages)
    }));
  };

  const handlePrevPage = () => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1)
    }));
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteExpense(deleteId).unwrap(); 
        setDeleteId(null);
        refetch();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleFormSubmit = async (data: Omit<Expense, 'id'>) => {
    if (editing) {
      await updateExpense({ id: editing.id, ...data });
    }
    setShowForm(false);
    setEditing(null);
    refetch();
  };

  const handleUploadSubmit = async (formData: FormData) => {
    try {
      await createExpense(formData).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to upload expense:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await approveExpense(id).unwrap();
      refetch();
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve expense. Please try again.');
    } finally {
      setLoading(false);
      setDetailsExpense(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      await rejectExpense({ id }).unwrap();
      refetch();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoading(false);
      setDetailsExpense(null);
    }
  };

  // Get unique categories and statuses for filter dropdowns
  const categories = ['maintenance', 'utilities', 'taxes', 'insurance', 'other'];
  const statusOptions = ['all', 'pending', 'approved', 'rejected'];

  if (isLoading) {
    return <div className="p-8 text-center">Loading expenses...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load expenses.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage property expenses</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            icon={<RefreshCw size={20} />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button variant="outline" icon={<Download size={20} />} onClick={handleExport}>
            Export
          </Button>
          <Button 
            variant="outline" 
            icon={<Building size={20} />} 
            onClick={handlePropertyFilter}
          >
            {selectedProperty 
              ? properties.find((p: { _id: string; }) => p._id === selectedProperty)?.name || 'View Property'
              : 'View Property'
            }
          </Button>
          <Button variant="primary" icon={<Plus size={20} />} onClick={handleAdd}>
            Add Expense
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
                placeholder="Search expenses by property, description, vendor, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex space-x-3">
              <select 
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select 
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedExpenses.map((expense) => (
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                      <span title="View Details">
                        <Button variant="outline" onClick={() => setDetailsExpense(expense)}>
                          <Eye size={16} />
                        </Button>
                      </span>
                      <span title="Delete">
                        <Button variant="danger" onClick={() => handleDelete(expense.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayedExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {allExpenses.length === 0 
                ? 'No expenses found.' 
                : 'No expenses match your search criteria.'
              }
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {displayedExpenses.length} of {filteredExpenses.length} expenses
              {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
              {selectedProperty && ` for ${properties.find((p: { _id: string; }) => p._id === selectedProperty)?.name}`}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {showForm && (
        <ExpenseForm
          initial={editing || undefined}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          properties={properties}
        />
      )}

      <UploadExpenseModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUploadSubmit}
        loading={isUploading}
        properties={properties}
      />

      <PropertyFilterModal
        open={showPropertyFilter}
        onClose={() => setShowPropertyFilter(false)}
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={handleSelectProperty}
      />

      <DeleteModal
        open={deleteId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ExpenseDetailsModal
        expense={detailsExpense}
        onClose={() => setDetailsExpense(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </div>
  );
};

export default LandlordExpenses;