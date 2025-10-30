import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ category: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll(filter);
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setFilter({ ...filter, category: e.target.value });
  };

  if (loading) return <div className="loading">Loading events...</div>;

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
          marginBottom: '1.5rem', 
          fontSize: '2rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎉 Upcoming Events
        </h2>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={filter.search}
            onChange={handleSearch}
            style={{ 
              flex: 1, 
              minWidth: '250px',
              padding: '0.75rem 1rem', 
              borderRadius: '10px', 
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          <select
            value={filter.category}
            onChange={handleCategoryChange}
            style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '10px', 
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
              minWidth: '180px',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="">All Categories</option>
            <option value="Concert">🎵 Concert</option>
            <option value="Sports">⚽ Sports</option>
            <option value="Conference">💼 Conference</option>
            <option value="Theater">🎭 Theater</option>
            <option value="Festival">🎊 Festival</option>
            <option value="Workshop">🛠️ Workshop</option>
          </select>
        </div>
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
          <p style={{ fontSize: '1.2rem' }}>No events found</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div
              key={event._id}
              className="event-card"
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <img src={event.imageUrl} alt={event.title} className="event-image" />
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-info">📅 {new Date(event.date).toLocaleDateString()}</p>
                <p className="event-info">📍 {event.venue}</p>
                <p className="event-info">🎭 {event.category}</p>
                <p className="event-info">
                  🪑 {event.availableSeats} / {event.totalSeats} seats available
                </p>
                <p className="event-price">₹{event.ticketPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
