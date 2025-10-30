const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  numberOfSeats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'used'],
    default: 'confirmed'
  },
  checkedInAt: {
    type: Date
  }
});

// Generate unique booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCode) {
    this.qrCode = `BK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
