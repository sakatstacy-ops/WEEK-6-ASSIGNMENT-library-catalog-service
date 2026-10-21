const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const { authenticate, requireLibrarian } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../utils/http');
const {
  bookingOverlapFilter,
  isValidDate,
  isValidTime,
} = require('../utils/libraryRules');

const router = express.Router();

router.get('/', authenticate, requireLibrarian, asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('space', 'name')
    .populate('user', 'username email')
    .sort({ date: 1, startTime: 1 });
  res.json({ bookings });
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { space, date, startTime, endTime } = req.body;
  if (
    typeof space !== 'string'
    || !mongoose.Types.ObjectId.isValid(space)
    || !isValidDate(date)
    || !isValidTime(startTime)
    || !isValidTime(endTime)
  ) {
    throw new HttpError(400, 'Provide a valid space id, date (YYYY-MM-DD), and start/end times (HH:mm).');
  }
  if (startTime >= endTime) {
    throw new HttpError(400, 'The booking end time must be later than its start time.');
  }

  const selectedSpace = await Space.findOne({ _id: space, active: true });
  if (!selectedSpace) {
    throw new HttpError(404, 'The selected space does not exist or is inactive.');
  }

  const bookingDate = new Date(`${date}T00:00:00.000Z`);
  const overlap = await Booking.exists(
    bookingOverlapFilter(space, bookingDate, startTime, endTime),
  );
  if (overlap) {
    throw new HttpError(409, 'This space is already booked for an overlapping time range.');
  }

  const booking = await Booking.create({
    space,
    user: req.user._id,
    date: bookingDate,
    startTime,
    endTime,
  });
  await booking.populate('space', 'name');
  await booking.populate('user', 'username email');
  res.status(201).json({ booking });
}));

module.exports = router;
