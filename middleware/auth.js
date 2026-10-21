const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, HttpError } = require('../utils/http');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication is required.');
  }

  let payload;
  try {
    payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, 'The authentication token is invalid or expired.');
    }
    throw error;
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new HttpError(401, 'The authentication token is invalid.');
  }

  const user = await User.findById(payload.sub).select('_id username email role readingList');
  if (!user) {
    throw new HttpError(401, 'The account for this token no longer exists.');
  }

  req.user = user;
  next();
});

function requireLibrarian(req, res, next) {
  if (!req.user) {
    return next(new HttpError(401, 'Authentication is required.'));
  }
  if (req.user.role !== 'librarian') {
    return next(new HttpError(403, 'Librarian access is required.'));
  }
  return next();
}

module.exports = { authenticate, requireLibrarian };
