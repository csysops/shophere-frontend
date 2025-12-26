// src/components/AuthDebugger.tsx
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Debug component to check authentication status
 * This component displays the current authentication state and token status
 */
export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState({
    hasAccessToken: false,
    hasRefreshToken: false,
    accessToken: '',
    user: null as any,
  });

  useEffect(() => {
    const updateTokenInfo = () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      let userData = null;

      try {
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }

      setTokenInfo({
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'No token',
        user: userData,
      });
    };

    updateTokenInfo();
    
    // Update every second
    const interval = setInterval(updateTokenInfo, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        p: 2, 
        maxWidth: 400,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        🔍 Auth Debugger
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Auth Status:</Typography>
          <Chip 
            label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
            color={isAuthenticated ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Access Token:</Typography>
          <Chip 
            label={tokenInfo.hasAccessToken ? 'Present' : 'Missing'} 
            color={tokenInfo.hasAccessToken ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Refresh Token:</Typography>
          <Chip 
            label={tokenInfo.hasRefreshToken ? 'Present' : 'Missing'} 
            color={tokenInfo.hasRefreshToken ? 'success' : 'error'}
            size="small"
          />
        </Box>

        {tokenInfo.hasAccessToken && (
          <Typography variant="caption" sx={{ wordBreak: 'break-all', mt: 1 }}>
            Token: {tokenInfo.accessToken}
          </Typography>
        )}

        {user && (
          <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">User:</Typography>
            <Typography variant="caption" display="block">
              Email: {user.email}
            </Typography>
            <Typography variant="caption" display="block">
              Role: {user.role}
            </Typography>
            <Typography variant="caption" display="block">
              ID: {user.id}
            </Typography>
          </Box>
        )}

        <Button 
          variant="outlined" 
          size="small" 
          color="error"
          onClick={handleClearTokens}
          sx={{ mt: 1 }}
        >
          Clear Tokens & Reload
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthDebugger;

