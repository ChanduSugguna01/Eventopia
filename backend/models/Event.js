const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required']
  },
  category: {
    type: String,
    enum: ['Concert', 'Sports', 'Conference', 'Theater', 'Festival', 'Workshop', 'Other'],
    default: 'Other'
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: 1
  },
  availableSeats: {
    type: Number,
    required: false
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=Event'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Initialize availableSeats to totalSeats on creation
eventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
