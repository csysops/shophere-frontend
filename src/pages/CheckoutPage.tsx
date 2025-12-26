import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number | string;
  product?: {
    name: string;
  };
}

interface Order {
  id: string;
  total: number | string;
  items: OrderItem[];
}

interface LocationState {
  orders: Order[];
  totalAmount: number | string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state || !state.orders || state.orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          No orders to process. Please go back to cart.
          <Button onClick={() => navigate('/cart')} sx={{ ml: 2 }}>
            Go to Cart
          </Button>
        </Alert>
      </Container>
    );
  }

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Update each order status to COMPLETED
      const updatePromises = state.orders.map((order) =>
        ordersAPI.updateOrderStatus(order.id, 'COMPLETED')
      );

      await Promise.all(updatePromises);

      // Show success message
      alert('Order confirmed! Please prepare cash payment upon delivery.');
      navigate('/orders');
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Checkout
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Payment Method Info */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Cash on Delivery (COD)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay with cash when you receive your order
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              Your order will be prepared and delivered to you. Please prepare cash payment upon delivery.
            </Alert>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                📦 Delivery Instructions:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Our delivery team will contact you before arrival<br />
                • Please prepare exact amount in cash<br />
                • Check your order before payment<br />
                • Estimated delivery: 2-3 business days
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: '0 0 300px' }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Number of Orders: {state.orders.length}
              </Typography>
              {state.orders.map((order, index) => (
                <Box key={order.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Order #{order.id.substring(0, 8)}
                  </Typography>
                  {order.items.map((item, itemIndex) => (
                    <Box
                      key={item.id || itemIndex}
                      sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, pl: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        - Item (Qty: {item.quantity})
                      </Typography>
                      <Typography variant="body2">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed #eee' }}>
                    <Typography variant="body2" fontWeight="bold">Subtotal</Typography>
                    <Typography variant="body2" fontWeight="bold">${Number(order.total).toFixed(2)}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6" color="primary">
                ${Number(state.totalAmount).toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePayment}
              disabled={processing}
              sx={{ mb: 2 }}
            >
              {processing ? <CircularProgress size={24} /> : 'Confirm Order (COD)'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/cart')}
              disabled={processing}
            >
              Back to Cart
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CheckoutPage;

