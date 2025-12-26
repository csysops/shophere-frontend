// src/pages/CreateOrderPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { ordersAPI } from '../services/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
}

const CreateOrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity: initialQuantity } = (location.state as {
    product: Product;
    quantity?: number;
  }) || {};

  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">No product selected</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Browse Products
        </Button>
      </Container>
    );
  }

  const totalPrice = parseFloat(product.price) * quantity;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await ordersAPI.create({
        productId: product.id,
        quantity,
      });

      // Success! Redirect to orders page
      navigate('/orders', {
        state: {
          message: `Order placed successfully! Order ID: ${data.id}`,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <ShoppingCart sx={{ verticalAlign: 'middle', mr: 1 }} />
        Place Your Order
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              component="img"
              src={product.imageUrl || 'https://via.placeholder.com/200'}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {product.description}
            </Typography>
            <Typography variant="h6" color="primary">
              ${parseFloat(product.price).toFixed(2)} per item
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1">${totalPrice.toFixed(2)}</Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body1">Shipping:</Typography>
            <Typography variant="body1">Free</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6" color="primary">
              ${totalPrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          By placing your order, you agree to our terms and conditions.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CreateOrderPage;

