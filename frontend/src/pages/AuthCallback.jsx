import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      alert('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token) {
      setStatus('Storing token...');
      // Store token
      localStorage.setItem('token', token);

      setStatus('Fetching user details...');
      // Fetch user details using the api service
      api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.data.user) {
            // Store user data
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setStatus('Success! Redirecting...');
            setTimeout(() => {
              // Force page reload to update AuthContext
              window.location.href = '/';
            }, 500);
          } else {
            throw new Error('Failed to fetch user');
          }
        })
        .catch(err => {
          console.error('Auth error:', err);
          setStatus('Authentication failed. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        });
    } else {
      setStatus('No token found. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '3rem' }}>🔐</div>
      <div style={{ fontSize: '1.2rem', color: 'white' }}>{status}</div>
    </div>
  );
}

export default AuthCallback;
