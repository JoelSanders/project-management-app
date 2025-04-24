import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const MfaPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyMfa } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code) {
      return setError('Please enter the verification code');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await verifyMfa(code);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            UCL Project Hub
          </Typography>
          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Please enter the verification code sent to your device
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Verification Code"
              name="code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              placeholder="123456"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MfaPage;
