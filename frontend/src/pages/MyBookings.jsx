import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, qrcodeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMy();
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleShowQR = async (bookingId) => {
    try {
      const response = await qrcodeAPI.generate(bookingId);
      setSelectedQR(response.data);
    } catch (err) {
      alert('Failed to generate QR code');
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="container">
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎫 My Bookings
        </h2>
      </div>

      {error && <div className="error">{error}</div>}

      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📭 No bookings yet</p>
          <p>Start exploring events and book your tickets!</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                marginBottom: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a' }}>
                    {booking.event.title}
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📅</span> {new Date(booking.event.date).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📍</span> {booking.event.venue}
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>🪑 Seats:</strong> {booking.numberOfSeats}
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>💰 Total:</strong> 
                      <span style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '700' }}>
                        ₹{booking.totalAmount}
                      </span>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>📋 Reference:</strong> 
                      <code style={{ 
                        background: '#f8fafc', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                      }}>
                        {booking.qrCode}
                      </code>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>Status:</strong>{' '}
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background:
                            booking.status === 'confirmed'
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : booking.status === 'cancelled'
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                              : 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white'
                        }}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                  {booking.status === 'confirmed' && (
                    <>
                      <button onClick={() => handleShowQR(booking._id)} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        📱 Show QR Code
                      </button>
                      <button onClick={() => handleCancelBooking(booking._id)} className="btn btn-danger" style={{ whiteSpace: 'nowrap' }}>
                        ❌ Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQR && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="qr-container"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '450px',
              width: '100%',
              animation: 'slideUp 0.3s ease'
            }}
          >
            <h3 style={{ 
              fontSize: '1.75rem', 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🎫 Your Ticket
            </h3>
            <img 
              src={selectedQR.qrCode} 
              alt="QR Code" 
              style={{ 
                width: '100%', 
                maxWidth: '300px',
                padding: '1rem',
                background: 'white',
                borderRadius: '12px'
              }} 
            />
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Booking Reference</strong>
              </p>
              <p style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700',
                fontFamily: 'monospace',
                color: '#0f172a'
              }}>
                {selectedQR.bookingReference}
              </p>
            </div>
            <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              📱 Show this QR code at the venue entrance for check-in
            </p>
            <button 
              onClick={() => setSelectedQR(null)} 
              className="btn btn-secondary" 
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
