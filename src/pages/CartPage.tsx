import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, checkout } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (cartItemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      try {
        await updateCartItem(cartItemId, newQuantity);
      } catch (err) {
        console.error('Failed to update quantity');
      }
    }
  };

  const handleRemove = async (cartItemId: string) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(cartItemId);
      } catch (err) {
        console.error('Failed to remove item');
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Failed to clear cart');
      }
    }
  };

  const handleCheckout = async () => {
    try {
      const result = await checkout();

      // Calculate total amount
      const totalAmount = result.orders.reduce((sum: number, order: any) => sum + Number(order.total), 0);

      // Navigate to checkout page with order data
      navigate('/checkout', {
        state: {
          orders: result.orders,
          totalAmount: totalAmount,
        },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (loading && !cart) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" paragraph>
            Browse our products and add items to your cart
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Cart Items */}
        <Box sx={{ flex: { md: '1 1 66%' } }}>
          <Paper sx={{ p: 2 }}>
            {cart.items.map((item) => (
              <Card key={item.id} sx={{ display: 'flex', mb: 2, p: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 120, objectFit: 'contain' }}
                  image={item.productImageUrl || '/placeholder.png'}
                  alt={item.productName}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price: ${item.productPrice.toFixed(2)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={loading}
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={loading}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" sx={{ ml: 'auto' }}>
                      ${item.subtotal.toFixed(2)}
                    </Typography>

                    <IconButton
                      color="error"
                      onClick={() => handleRemove(item.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Clear Cart
            </Button>
          </Paper>
        </Box>

        {/* Cart Summary */}
        <Box sx={{ flex: { md: '1 1 33%' } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Items ({cart.totalItems}):</Typography>
              <Typography>${cart.totalPrice.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>FREE</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${cart.totalPrice.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Proceed to Checkout'}
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/products')}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;

