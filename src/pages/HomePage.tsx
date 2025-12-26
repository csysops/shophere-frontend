// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Store,
  ShoppingCart,
  Security,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <Store fontSize="large" color="primary" />,
      title: 'Wide Selection',
      description: 'Browse thousands of products across multiple categories',
    },
    {
      icon: <Speed fontSize="large" color="primary" />,
      title: 'Fast Delivery',
      description: 'Get your orders delivered quickly and reliably',
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Secure Payments',
      description: 'Shop with confidence using our secure payment system',
    },
    {
      icon: <ShoppingCart fontSize="large" color="primary" />,
      title: 'Easy Shopping',
      description: 'Intuitive interface for seamless shopping experience',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to ShopSphere
              </Typography>
              <Typography variant="h5" paragraph>
                Your one-stop shop for everything you need
              </Typography>
              {isAuthenticated ? (
                <Box>
                  <Typography variant="body1" paragraph>
                    Welcome back, {user?.firstName || user?.email}!
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => navigate('/products')}
                    sx={{ mr: 2 }}
                  >
                    Browse Products
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ color: 'white', borderColor: 'white' }}
                    onClick={() => navigate('/orders')}
                  >
                    My Orders
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => navigate('/register')}
                    sx={{ mr: 2 }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ color: 'white', borderColor: 'white' }}
                    onClick={() => navigate('/products')}
                  >
                    Browse Products
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="https://via.placeholder.com/600x400?text=ShopSphere"
                alt="ShopSphere Hero"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Why Shop With Us?
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 6 }}
        >
          We provide the best shopping experience with our exceptional features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Ready to Start Shopping?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Join thousands of satisfied customers and discover amazing products today
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
            >
              Start Shopping Now
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                ShopSphere
              </Typography>
              <Typography variant="body2">
                Your trusted e-commerce platform for quality products and exceptional service.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="span" sx={{ display: 'block', mb: 1, cursor: 'pointer' }} onClick={() => navigate('/products')}>
                  Products
                </Box>
                <Box component="span" sx={{ display: 'block', mb: 1, cursor: 'pointer' }} onClick={() => navigate('/orders')}>
                  Orders
                </Box>
                <Box component="span" sx={{ display: 'block', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                  Account
                </Box>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2">
                Email: support@shopsphere.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Shop St, Commerce City
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" align="center" sx={{ mt: 4 }}>
            © 2025 ShopSphere. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;

