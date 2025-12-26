// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Rating,
  Divider,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { ArrowBack, AddShoppingCart } from '@mui/icons-material';
import { productsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  imageUrl?: string;
  categoryName: string;
  ratingRate?: number;
  ratingCount?: number;
}

interface Review {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await productsAPI.getById(id!);
      setProduct(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await reviewsAPI.getProductReviews(id!);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setAddingToCart(true);
      await addToCart(id!, quantity);
      alert('Product added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!reviewRating) {
      alert('Please select a rating');
      return;
    }
    
    try {
      setSubmittingReview(true);
      await reviewsAPI.create({
        productId: id!,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      fetchReviews();
      fetchProduct(); // Refresh to get updated rating
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Product Image */}
        <Box sx={{ flex: { md: '1 1 50%' } }}>
          <Paper sx={{ p: 2 }}>
            <img
              src={product.imageUrl || 'https://via.placeholder.com/500?text=No+Image'}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
              }}
            />
          </Paper>
        </Box>

        {/* Product Details */}
        <Box sx={{ flex: { md: '1 1 50%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.ratingRate || 0} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.ratingCount || 0} reviews)
              </Typography>
            </Box>

            <Typography variant="h4" color="primary" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description || 'No description available'}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category: {product.categoryName}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              SKU: {product.sku}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Quantity Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Quantity:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>

        {isAuthenticated && !showReviewForm && (
          <Button
            variant="outlined"
            onClick={() => setShowReviewForm(true)}
            sx={{ mb: 3 }}
          >
            Write a Review
          </Button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Write Your Review
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={reviewRating}
                onChange={(event, newValue) => setReviewRating(newValue)}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Alert severity="info">No reviews yet. Be the first to review!</Alert>
        ) : (
          <Box>
            {reviews.map((review) => (
              <Card key={review.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar>{review.userName?.charAt(0) || review.userEmail?.charAt(0) || 'U'}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {review.userName || review.userEmail || 'Anonymous'}
                      </Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                  </Box>
                  {review.comment && (
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
