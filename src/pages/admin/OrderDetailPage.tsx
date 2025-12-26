import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Email,
  Receipt,
  DateRange,
  LocalShipping,
  Refresh,
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  price: number | string;
  imageUrl?: string | null;
  sku?: string | null;
  description?: string | null;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number | string;
  product: Product;
}

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface OrderDetail {
  id: string;
  userId: string;
  total: number | string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User | null;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

const formatCurrency = (value: number | string | null | undefined) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed.toFixed(2);
    }
  }
  return '0.00';
};

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }
    try {
      setLoading(true);
      const response = await ordersAPI.getOrderByIdAdmin(orderId);
      setOrder(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      setError(err.response?.data?.message || 'Failed to load order detail');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) {
      return;
    }
    try {
      setUpdatingStatus(true);
      await ordersAPI.updateOrderStatusAdmin(order.id, newStatus);
      await fetchOrder();
      setError(null);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const customerName = useMemo(() => {
    if (!order?.user) {
      return 'N/A';
    }
    const { firstName, lastName } = order.user;
    if (firstName || lastName) {
      return `${firstName ?? ''} ${lastName ?? ''}`.trim();
    }
    return 'N/A';
  }, [order]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Alert severity="warning">Order not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                Order #{order.id.substring(0, 8)}
              </Typography>
              <Chip
                label={STATUS_LABELS[order.status] || order.status}
                color={getStatusColor(order.status)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrder}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Order Items */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Order Items" subheader={`${order.items.length} item(s)`} />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={item.product.imageUrl || undefined}
                            variant="rounded"
                            sx={{ width: 48, height: 48 }}
                          >
                            {item.product.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{item.product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item.product.sku || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">${formatCurrency(item.price)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ${formatCurrency(Number(item.price) * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  <Typography variant="body2">${formatCurrency(order.total)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                  <Typography variant="body2">Free</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    ${formatCurrency(order.total)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Customer & Status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Status Card */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Order Status"
              avatar={<LocalShipping color="primary" />}
            />
            <Divider />
            <CardContent>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Update Status</InputLabel>
                <Select
                  value={order.status}
                  label="Update Status"
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block">
                Last updated: {new Date(order.updatedAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card>
            <CardHeader
              title="Customer Details"
              avatar={<Person color="primary" />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2">{customerName}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{order.user?.email || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {order.userId}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailPage;

