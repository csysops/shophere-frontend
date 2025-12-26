import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import { Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { ordersAPI } from '../services/api';

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

interface OrderDetail {
  id: string;
  userId: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  total: number | string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

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

const ClientOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyOrder = async () => {
      if (!orderId) {
        return;
      }
      try {
        setLoading(true);
        // Backend chưa có endpoint get-my-order-by-id -> tạm thời lấy danh sách và lọc
        const { data } = await ordersAPI.getMyOrders();
        const found = Array.isArray(data) ? data.find((o: any) => o.id === orderId) : null;
        if (!found) {
          setError('Order not found');
          setOrder(null);
        } else {
          setOrder(found);
          setError(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order detail');
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="text" width={160} height={36} />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          }}
        >
          <Box>
            <Card>
              <Skeleton variant="rectangular" height={260} />
              <CardContent>
                <Skeleton variant="text" height={28} width="60%" />
                <Skeleton variant="text" height={22} width="40%" />
                <Skeleton variant="text" height={22} width="30%" />
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={28} width="50%" />
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Skeleton variant="text" height={22} />
                  <Skeleton variant="text" height={22} />
                  <Skeleton variant="text" height={22} />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            color: 'error.main',
          }}
        >
          {error}
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back to Orders
        </Button>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography>Order not found.</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 1 }}
          >
            Back to Orders
          </Button>
          <Typography variant="h4" fontWeight={700}>
            Order Detail
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            View the details of your order #{order.id.substring(0, 8)}.
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="caption" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {order.id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created on {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        }}
      >
        <Box>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={order.status}
                  color={STATUS_COLOR[order.status] || 'default'}
                  size="small"
                />
              </Stack>
              <Typography variant="h6" gutterBottom>
                Items ({order.items.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {order.items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                        flexShrink: 0,
                      }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                          <ShoppingBagIcon color="disabled" />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity} x ${formatCurrency(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      ${formatCurrency(Number(item.price) * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                  <Typography variant="body2">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    ${formatCurrency(order.total)}
                  </Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/orders')}
                >
                  Back to My Orders
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default ClientOrderDetailPage;


