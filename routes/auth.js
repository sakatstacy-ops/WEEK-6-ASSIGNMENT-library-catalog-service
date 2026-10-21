const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../utils/http');

const router = express.Router();
const PASSWORD_MIN_LENGTH = 10;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (
    typeof username !== 'string'
    || username.trim().length < 3
    || typeof email !== 'string'
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof password !== 'string'
    || password.length < PASSWORD_MIN_LENGTH
  ) {
    throw new HttpError(400, `Provide a username, valid email, and password with at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Username and password are required.');
  }

  const user = await User.findOne({ username: username.trim() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'The username or password is incorrect.');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
