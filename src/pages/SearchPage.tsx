import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Pagination,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
}

const DEFAULT_PAGE_SIZE = 12;

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Derive state from URL
  const qFromUrl = searchParams.get('q') ?? '';
  const pageFromUrl = Number(searchParams.get('page') ?? '1');

  // Local input state mirrors qFromUrl but allows editing before submit
  const [inputValue, setInputValue] = useState(qFromUrl);

  useEffect(() => {
    // Keep input in sync if URL changes elsewhere
    setInputValue(qFromUrl);
  }, [qFromUrl]);

  const effectiveParams = useMemo(
    () => ({
      q: qFromUrl || undefined,
      page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [qFromUrl, pageFromUrl]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      // If no search query, don't fetch
      if (!effectiveParams.q) {
        setProducts([]);
        setTotalPages(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const { data } = await productsAPI.getAll(effectiveParams);
        setProducts(Array.isArray(data.items) ? data.items : []);
        if (data.total && data.pageSize) {
          setTotalPages(Math.ceil(data.total / data.pageSize));
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch products');
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [effectiveParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputValue.trim()) {
      next.set('q', inputValue.trim());
    } else {
      next.delete('q');
    }
    next.set('page', '1');
    setSearchParams(next, { replace: false });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(value));
    setSearchParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Search
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search products..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          variant="outlined"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {products.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No products found.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <Card>
                    {product.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={product.imageUrl}
                        alt={product.name}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 180,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                        }}
                      >
                        <Typography color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" noWrap title={product.name}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap title={product.description}>
                        {product.description || 'No description'}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/products/${product.id}`)}>
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={effectiveParams.page}
              color="primary"
              onChange={handlePageChange}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default SearchPage;


