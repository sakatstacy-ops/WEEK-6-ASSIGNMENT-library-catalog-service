process.env.JWT_SECRET = 'week-seven-test-secret-with-more-than-32-characters';
process.env.MONGODB_URI = 'mongodb://127.0.0.1/library-catalog-test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const app = require('../server');

const patronId = '507f1f77bcf86cd799439011';

function tokenFor(userId = patronId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('booking route authentication and role authorization', () => {
  test('rejects a request with no token', async () => {
    const response = await request(app).get('/api/bookings');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication is required.' });
  });

  test('rejects a patron token on the librarian-only bookings route', async () => {
    const patron = {
      _id: patronId,
      username: 'reader',
      email: 'reader@example.com',
      role: 'patron',
    };
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(patron),
    });

    const response = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${tokenFor()}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Librarian access is required.' });
  });
});
