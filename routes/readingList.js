const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../utils/http');

const router = express.Router();
router.use(authenticate);

function requireValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'The supplied book id is not valid.');
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const user = await req.user.populate({
    path: 'readingList',
    populate: { path: 'genre', select: 'name slug' },
  });
  res.json({ books: user.readingList });
}));

router.post('/:bookId', asyncHandler(async (req, res) => {
  requireValidId(req.params.bookId);
  const bookExists = await Book.exists({ _id: req.params.bookId });
  if (!bookExists) {
    throw new HttpError(404, 'Book not found.');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { readingList: req.params.bookId } },
    { new: true },
  ).populate({
    path: 'readingList',
    populate: { path: 'genre', select: 'name slug' },
  });
  res.status(201).json({ books: user.readingList });
}));

router.delete('/:bookId', asyncHandler(async (req, res) => {
  requireValidId(req.params.bookId);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { readingList: req.params.bookId } },
    { new: true },
  ).populate({
    path: 'readingList',
    populate: { path: 'genre', select: 'name slug' },
  });
  res.json({ books: user.readingList });
}));

module.exports = router;
