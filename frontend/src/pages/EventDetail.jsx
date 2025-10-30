import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      setEvent(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBooking(true);
      setError('');
      await bookingsAPI.create({
        eventId: id,
        numberOfSeats: parseInt(numberOfSeats),
      });
      setSuccess('Booking successful! Check your bookings.');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return <div className="container">Event not found</div>;

  return (
    <div className="container">
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
        />

        <div style={{ padding: '2rem' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            {event.category}
          </div>

          <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            {event.title}
          </h2>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>📅 Date & Time</strong>
              </p>
              <p style={{ fontSize: '1rem' }}>{new Date(event.date).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>📍 Venue</strong>
              </p>
              <p style={{ fontSize: '1rem' }}>{event.venue}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>🪑 Available Seats</strong>
              </p>
              <p style={{ fontSize: '1rem', fontWeight: '600', color: event.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
                {event.availableSeats} / {event.totalSeats}
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong>💰 Price</strong>
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                ₹{event.ticketPrice}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>About This Event</h3>
            <p style={{ lineHeight: '1.8', color: '#475569' }}>{event.description}</p>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {event.availableSeats > 0 && (
            <form onSubmit={handleBooking} style={{
              background: '#f8fafc',
              padding: '2rem',
              borderRadius: '12px',
              marginTop: '2rem'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>🎫 Book Your Tickets</h3>
              <div className="form-group">
                <label>Number of Seats</label>
                <input
                  type="number"
                  min="1"
                  max={event.availableSeats}
                  value={numberOfSeats}
                  onChange={(e) => setNumberOfSeats(e.target.value)}
                  required
                  style={{ fontSize: '1.1rem' }}
                />
              </div>
              <div style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '2px solid #e2e8f0'
              }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Amount</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                  ₹{event.ticketPrice * numberOfSeats}
                </p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={booking} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                {booking ? '⏳ Booking...' : '✨ Book Now'}
              </button>
            </form>
          )}

          {event.availableSeats === 0 && (
            <div className="error" style={{ textAlign: 'center', fontSize: '1.1rem' }}>
              😔 This event is sold out!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
