// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useUserStore } from '../stores/userStore';

const ProfilePage: React.FC = () => {
  const { user, loading, error, updateProfile, fetchProfile, clearError } = useUserStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState('');
  const [localError, setLocalError] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile().catch(() => {
      // Error is handled by the store
    });
  }, [fetchProfile]);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');

    try {
      await updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        avatar: avatarUrl || undefined,
      });
      
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || err.message || 'Failed to update profile');
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading && !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        {/* Avatar Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            sx={{ 
              width: 120, 
              height: 120,
              fontSize: '3rem',
              bgcolor: 'primary.main'
            }}
          >
            {!avatarUrl && getInitials()}
          </Avatar>
        </Box>

        {/* Display Errors */}
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => { clearError(); setLocalError(''); }}>
            {localError || error}
          </Alert>
        )}

        {/* Display Success */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Profile Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Email (Read-only) */}
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />

            {/* First Name & Last Name */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </Box>

            {/* Avatar URL */}
            <TextField
              fullWidth
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              helperText="Enter a URL to your profile picture"
              InputProps={{
                endAdornment: (
                  <PhotoCamera color="action" />
                ),
              }}
            />

            {/* Account Info (Read-only) */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="Role"
                value={user?.role || 'CUSTOMER'}
                disabled
              />
              <TextField
                fullWidth
                label="Account Status"
                value={user?.isVerified ? 'Verified' : 'Not Verified'}
                disabled
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
