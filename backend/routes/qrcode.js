const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const { authMiddleware } = require('../middleware/auth');

// Generate QR code for a booking
router.get('/:bookingId', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('event', 'title date venue')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate QR code data
    const qrData = {
      bookingId: booking._id,
      qrCode: booking.qrCode,
      eventTitle: booking.event.title,
      userName: booking.user.name,
      seats: booking.numberOfSeats,
      status: booking.status
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    res.json({
      qrCode: qrCodeDataURL,
      bookingReference: booking.qrCode,
      booking: qrData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify QR code (for event check-in)
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    const booking = await Booking.findOne({ qrCode })
      .populate('event', 'title date venue')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking has been cancelled' });
    }

    if (booking.status === 'used') {
      return res.status(400).json({ 
        error: 'Ticket already used',
        checkedInAt: booking.checkedInAt
      });
    }

    // Mark as used
    booking.status = 'used';
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({
      message: 'Check-in successful',
      booking: {
        id: booking._id,
        user: booking.user.name,
        event: booking.event.title,
        seats: booking.numberOfSeats,
        checkedInAt: booking.checkedInAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
