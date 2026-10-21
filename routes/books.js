const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const BorrowRequest = require('../models/BorrowRequest').BorrowRequest;
const Genre = require('../models/Genre');
const { authenticate, requireLibrarian } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../utils/http');

const router = express.Router();
const editableFields = [
  'title',
  'author',
  'isbn',
  'description',
  'coverImage',
  'totalCopies',
  'availableCopies',
  'genre',
];

function bookValues(body) {
  const values = {};
  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      values[field] = body[field];
    }
  }
  return values;
}

function requireValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'The supplied id is not valid.');
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.find().populate('genre', 'name slug').sort({ title: 1 });
  res.json({ books });
}));

router.get('/genres', asyncHandler(async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.json({ genres });
}));

router.post('/', authenticate, requireLibrarian, asyncHandler(async (req, res) => {
  const book = await Book.create(bookValues(req.body));
  await book.populate('genre', 'name slug');
  res.status(201).json({ book });
}));

router.patch('/:id', authenticate, requireLibrarian, asyncHandler(async (req, res) => {
  requireValidId(req.params.id);
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new HttpError(404, 'Book not found.');
  }

  Object.assign(book, bookValues(req.body));
  await book.save();
  await book.populate('genre', 'name slug');
  res.json({ book });
}));

router.delete('/:id', authenticate, requireLibrarian, asyncHandler(async (req, res) => {
  requireValidId(req.params.id);
  const book = await Book.findById(req.params.id);
  if (!book) {
    throw new HttpError(404, 'Book not found.');
  }

  const outstandingRequest = await BorrowRequest.exists({
    book: book._id,
    status: { $ne: 'returned' },
  });
  if (outstandingRequest) {
    throw new HttpError(409, 'A book with an outstanding borrow request cannot be deleted.');
  }

  await book.deleteOne();
  res.status(204).end();
}));

module.exports = router;
