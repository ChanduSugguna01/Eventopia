import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ManageEvents() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, isAdmin]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;

    try {
      await eventsAPI.delete(eventId);
      setEvents(events.filter(e => e._id !== eventId));
      alert('Event deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    navigate('/edit-event', { state: { event } });
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="container">
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ 
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0
        }}>
          🎪 Manage Events
        </h2>
        <button 
          onClick={() => navigate('/create-event')} 
          className="btn btn-primary"
        >
          ➕ Create New Event
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1.2rem' }}>No events created yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {events.map((event) => (
            <div
              key={event._id}
              className="manage-event-card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e2e8f0',
                display: 'flex',
                gap: '2rem',
                alignItems: 'start',
                flexWrap: 'wrap'
              }}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  flexShrink: 0
                }}
              />
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>
                  {event.title}
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem', color: '#64748b' }}>
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>📍 {event.venue}</p>
                  <p>🎭 {event.category}</p>
                  <p>
                    🪑 <strong>{event.availableSeats}</strong> / {event.totalSeats} seats available
                  </p>
                  <p style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '700' }}>
                    💰 ₹{event.ticketPrice}
                  </p>
                  <p>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      background: event.status === 'upcoming' 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #64748b, #475569)',
                      color: 'white'
                    }}>
                      {event.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => handleEdit(event)}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id, event.title)}
                  className="btn btn-danger"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageEvents;
