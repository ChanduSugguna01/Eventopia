const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

// Create booking (authenticated users)
router.post(
  '/',
  [authMiddleware],
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('numberOfSeats').isInt({ min: 1 }).withMessage('Number of seats must be at least 1')
  ],
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await session.abortTransaction();
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventId, numberOfSeats } = req.body;

      // Find event with session
      const event = await Event.findById(eventId).session(session);
      
      if (!event) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check seat availability
      if (event.availableSeats < numberOfSeats) {
        await session.abortTransaction();
        return res.status(400).json({ 
          error: `Only ${event.availableSeats} seats available` 
        });
      }

      // Calculate total amount
      const totalAmount = event.ticketPrice * numberOfSeats;

      // Create booking
      const booking = new Booking({
        user: req.user._id,
        event: eventId,
        numberOfSeats,
        totalAmount
      });

      await booking.save({ session });

      // Update available seats
      event.availableSeats -= numberOfSeats;
      await event.save({ session });

      await session.commitTransaction();

      // Populate booking details
      await booking.populate([
        { path: 'user', select: 'name email' },
        { path: 'event', select: 'title date venue ticketPrice' }
      ]);

      res.status(201).json(booking);
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      session.endSession();
    }
  }
);

// Get user's bookings (authenticated users)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date venue ticketPrice imageUrl')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single booking (authenticated users)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'title date venue ticketPrice imageUrl');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking (authenticated users)
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    // Restore seats to event
    const event = await Event.findById(booking.event).session(session);
    if (event) {
      event.availableSeats += booking.numberOfSeats;
      await event.save({ session });
    }

    await session.commitTransaction();

    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'event', select: 'title date venue ticketPrice' }
    ]);

    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    session.endSession();
  }
});

module.exports = router;
