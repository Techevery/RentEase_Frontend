import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  ListAlt as AllPaymentsIcon,
} from '@mui/icons-material';

// --- TYPE DEFINITIONS ---

interface TenantDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  status: string;
  property: string;
  propertyAddress: string;
  unit: string;
}

interface SummaryData {
  totalPayments: number;
  totalAmount: number;
  approved: { count: number; amount: number };
  pending: { count: number; amount: number };
  rejected: { count: number; amount: number };
  averagePayment: number;
}

interface PaymentMethodData {
  [key: string]: { count: number; totalAmount: number };
}

interface MonthlyBreakdownData {
  [key: string]: { 
    count: number; 
    totalAmount: number; 
    payments: Payment[] 
  };
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate?: string;
  status: 'approved' | 'pending' | 'rejected';
  paymentMethod: string;
  description?: string;
  reference?: string;
  receiptUrl?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  flat?: string;
  property?: string;
  uploadedBy?: string;
  createdAt?: string;
}

interface RecentActivity {
  period: string;
  payments: Payment[];
}

interface TenantModalProps {
  open: boolean;
  onClose: () => void;
  tenantData: {
    tenant?: TenantDetails;
    summary?: SummaryData;
    paymentMethodBreakdown?: PaymentMethodData;
    monthlyBreakdown?: MonthlyBreakdownData;
    recentActivity?: RecentActivity;
    allPayments?: Payment[];
  } | null;
}

// --- HELPER COMPONENTS & UTILITIES ---

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const formatCurrency = (amount: number = 0) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const paymentMethodIcons: { [key: string]: React.ReactElement } = {
  'Bank Transfer': <BankIcon sx={{ mr: 1 }} fontSize="small" />,
  'Credit Card': <CardIcon sx={{ mr: 1 }} fontSize="small" />,
  'Cash': <CashIcon sx={{ mr: 1 }} fontSize="small" />,
  'Online': <ReceiptIcon sx={{ mr: 1 }} fontSize="small" />,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

const TenantDetailsModal: React.FC<TenantModalProps> = ({ open, onClose, tenantData }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!tenantData) return null;

  const { tenant, summary, paymentMethodBreakdown, monthlyBreakdown, recentActivity, allPayments } = tenantData;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          // Ensure dialog fits mobile screen
          margin: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' },
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} />
        Tenant Payment Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ 
        // Enable both horizontal and vertical scrolling on mobile
        overflow: 'auto',
        // Custom scrollbar for better mobile experience
        '&::-webkit-scrollbar': {
          height: 8,
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',
          borderRadius: 4,
        }
      }}>
        {/* Basic Info Section */}
        {tenant && (
          <Box sx={{ mb: 3, minWidth: { xs: '600px', sm: 'auto' } }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Stack><Typography variant="body2" color="text.secondary">Name</Typography><Typography>{tenant.name}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{tenant.email}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Phone</Typography><Typography>{tenant.phone}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Emergency Contact</Typography><Typography>{tenant.emergencyContact || 'N/A'}</Typography></Stack>
             
              <Stack><Typography variant="body2" color="text.secondary">Rent Amount</Typography><Typography>{formatCurrency(tenant.rentAmount)}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Lease Start</Typography><Typography>{formatDate(tenant.leaseStart)}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Lease End</Typography><Typography>{formatDate(tenant.leaseEnd)}</Typography></Stack>
              <Stack><Typography variant="body2" color="text.secondary">Status</Typography><Typography sx={{ textTransform: 'capitalize' }}>{tenant.status}</Typography></Stack>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ minWidth: '500px' }} // Ensure tabs are scrollable on mobile
          >
            <Tab icon={<TrendingUpIcon />} label="Summary" />
            <Tab icon={<ReceiptIcon />} label="Payment Methods" />
            <Tab icon={<CalendarIcon />} label="Monthly Breakdown" />
            <Tab icon={<AllPaymentsIcon />} label="Recent Activity" />
            <Tab icon={<AllPaymentsIcon />} label="All Payments" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        <TabPanel value={tabValue} index={0}>
          {summary ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
                gap: 2,
                textAlign: 'center',
                minWidth: { xs: '500px', sm: 'auto' }, // Enable horizontal scrolling on mobile
                overflowX: { xs: 'auto', sm: 'visible' },
              }}
            >
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="primary">{summary.totalPayments}</Typography><Typography variant="body2">Total Payments</Typography></Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="primary">{formatCurrency(summary.totalAmount)}</Typography><Typography variant="body2">Total Amount</Typography></Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="success.main">{summary.approved.count}</Typography><Typography variant="body2">Approved</Typography></Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="warning.main">{summary.pending.count}</Typography><Typography variant="body2">Pending</Typography></Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="error.main">{summary.rejected.count}</Typography><Typography variant="body2">Rejected</Typography></Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: '120px' }}><Typography variant="h6" color="primary">{formatCurrency(summary.averagePayment)}</Typography><Typography variant="body2">Average Payment</Typography></Paper>
            </Box>
          ) : <Typography>No summary data available.</Typography>}
        </TabPanel>

        {/* Payment Methods Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ minWidth: { xs: '500px', sm: 'auto' } }}>
              <Table size="small">
                <TableHead><TableRow><TableCell>Method</TableCell><TableCell align="right">Count</TableCell><TableCell align="right">Total Amount</TableCell></TableRow></TableHead>
                <TableBody>
                  {paymentMethodBreakdown && Object.keys(paymentMethodBreakdown).length > 0 ? (
                    Object.entries(paymentMethodBreakdown).map(([method, data]) => (
                      <TableRow key={method}>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}>{paymentMethodIcons[method] || <ReceiptIcon sx={{ mr: 1 }} />}{method}</Box></TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{formatCurrency(data.totalAmount)}</TableCell>
                      </TableRow>
                    ))
                  ) : <TableRow><TableCell colSpan={3} align="center">No payment method data available.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Monthly Breakdown Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, minWidth: { xs: '500px', sm: 'auto' } }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow><TableCell>Month</TableCell><TableCell align="right">Payments</TableCell><TableCell align="right">Total Amount</TableCell></TableRow></TableHead>
                <TableBody>
                  {monthlyBreakdown && Object.keys(monthlyBreakdown).length > 0 ? (
                    Object.entries(monthlyBreakdown).map(([month, data]) => (
                      <TableRow key={month}>
                        <TableCell>{month}</TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{formatCurrency(data.totalAmount)}</TableCell>
                      </TableRow>
                    ))
                  ) : <TableRow><TableCell colSpan={3} align="center">No monthly data available.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Recent Activity Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, minWidth: { xs: '600px', sm: 'auto' } }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity?.payments && recentActivity.payments.length > 0 ? (
                    recentActivity.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="caption" 
                            color={getStatusColor(payment.status)}
                            sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                          >
                            {payment.status}
                          </Typography>
                        </TableCell>
                        <TableCell>{payment.description || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{payment.reference}</TableCell>
                      </TableRow>
                    ))
                  ) : <TableRow><TableCell colSpan={6} align="center">No recent activity available.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* All Payments Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, minWidth: { xs: '600px', sm: 'auto' } }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPayments && allPayments.length > 0 ? (
                    allPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="caption" 
                            color={getStatusColor(payment.status)}
                            sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                          >
                            {payment.status}
                          </Typography>
                        </TableCell>
                        <TableCell>{payment.description || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{payment.reference}</TableCell>
                      </TableRow>
                    ))
                  ) : <TableRow><TableCell colSpan={6} align="center">No payment history available.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantDetailsModal;