// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Link,
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import axios from 'axios';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!code) {
        setStatus('error');
        setMessage('No verification code provided');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/verify-email?code=${code}`
        );
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Verification failed. Please try again.'
        );
      }
    };

    verifyEmail();
  }, [code, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Email Verification
        </Typography>

        {status === 'loading' && (
          <Box sx={{ mt: 4, mb: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Verifying your email...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <>
            <Box sx={{ mt: 4, mb: 4 }}>
              <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main' }} />
            </Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Redirecting to login page...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Box sx={{ mt: 4, mb: 4 }}>
              <ErrorOutline sx={{ fontSize: 80, color: 'error.main' }} />
            </Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Need help?{' '}
                <Link component={RouterLink} to="/resend-verification">
                  Resend verification email
                </Link>
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage;

