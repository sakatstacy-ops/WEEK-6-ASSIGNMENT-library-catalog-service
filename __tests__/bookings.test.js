process.env.JWT_SECRET = 'week-seven-test-secret-with-more-than-32-characters';
process.env.MONGODB_URI = 'mongodb://127.0.0.1/library-catalog-test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const User = require('../models/User');
const app = require('../server');

const patronId = '507f1f77bcf86cd799439011';
const spaceId = '507f1f77bcf86cd799439012';

afterEach(() => {
  jest.restoreAllMocks();
});

test('rejects a partially overlapping booking for the same space and date', async () => {
  jest.spyOn(User, 'findById').mockReturnValue({
    select: jest.fn().mockResolvedValue({
      _id: patronId,
      username: 'reader',
      email: 'reader@example.com',
      role: 'patron',
    }),
  });
  jest.spyOn(Space, 'findOne').mockResolvedValue({ _id: spaceId, active: true });
  jest.spyOn(Booking, 'exists').mockResolvedValue({ _id: 'existing-booking' });
  const token = jwt.sign({ sub: patronId }, process.env.JWT_SECRET);

  const response = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      space: spaceId,
      date: '2026-11-05',
      startTime: '10:30',
      endTime: '11:30',
    });

  expect(response.status).toBe(409);
  expect(response.body).toEqual({
    error: 'This space is already booked for an overlapping time range.',
  });
  expect(Booking.exists).toHaveBeenCalledWith({
    space: spaceId,
    date: new Date('2026-11-05T00:00:00.000Z'),
    startTime: { $lt: '11:30' },
    endTime: { $gt: '10:30' },
  });
});
