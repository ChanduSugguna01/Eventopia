import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EditEvent() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    venue: event?.venue || '',
    category: event?.category || 'Concert',
    totalSeats: event?.totalSeats || '',
    ticketPrice: event?.ticketPrice || '',
    imageUrl: event?.imageUrl || '',
    status: event?.status || 'upcoming'
  });

  useEffect(() => {
    if (!event) {
      navigate('/manage-events');
    }
  }, [event, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await eventsAPI.update(event._id, formData);
      alert('Event updated successfully!');
      navigate('/manage-events');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form-container" style={{ maxWidth: '600px' }}>
        <h2>✏️ Edit Event</h2>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Event Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Date & Time *</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Venue *</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="Concert">Concert</option>
            <option value="Sports">Sports</option>
            <option value="Conference">Conference</option>
            <option value="Theater">Theater</option>
            <option value="Festival">Festival</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Total Seats *</label>
          <input
            type="number"
            name="totalSeats"
            value={formData.totalSeats}
            onChange={handleChange}
            min="1"
            required
          />
          <small style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Note: Available seats will be adjusted automatically
          </small>
        </div>

        <div className="form-group">
          <label>Ticket Price (₹) *</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label>Image URL (optional)</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Updating...' : '✅ Update Event'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/manage-events')} 
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEvent;
