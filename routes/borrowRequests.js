const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const BorrowRequest = require('../models/BorrowRequest');
const { authenticate, requireLibrarian } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../utils/http');
const { calculateFine } = require('../utils/libraryRules');

const router = express.Router();
const VALID_STATUSES = ['pending', 'approved', 'returned', 'late'];
const DEFAULT_LOAN_DAYS = 14;

function requireValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'The supplied id is not valid.');
  }
}

function populated(query) {
  return query.populate('book', 'title author isbn availableCopies')
    .populate('user', 'username email');
}

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const filter = req.user.role === 'librarian' ? {} : { user: req.user._id };
  const requests = await populated(BorrowRequest.find(filter).sort({ requestedAt: -1 }));
  res.json({ borrowRequests: requests });
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  if (typeof bookId !== 'string' || !mongoose.Types.ObjectId.isValid(bookId)) {
    throw new HttpError(400, 'A valid bookId is required.');
  }
  const isOnReadingList = req.user.readingList.some((id) => id.toString() === bookId);
  if (!isOnReadingList) {
    throw new HttpError(403, 'Add this book to your reading list before requesting it.');
  }

  const session = await mongoose.startSession();
  let createdRequest;
  try {
    await session.withTransaction(async () => {
      const bookExists = await Book.exists({ _id: bookId }).session(session);
      if (!bookExists) {
        throw new HttpError(404, 'Book not found.');
      }

      const stockUpdate = await Book.updateOne(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 } },
        { session },
      );
      if (stockUpdate.modifiedCount !== 1) {
        throw new HttpError(409, 'No copies of this book are currently available.');
      }

      const dueAt = new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);
      [createdRequest] = await BorrowRequest.create([{
        book: bookId,
        user: req.user._id,
        requestedAt: new Date(),
        dueAt,
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  const request = await populated(BorrowRequest.findById(createdRequest._id));
  res.status(201).json({ borrowRequest: request });
}));

router.patch('/:id', authenticate, requireLibrarian, asyncHandler(async (req, res) => {
  requireValidId(req.params.id);
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new HttpError(400, `Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  const session = await mongoose.startSession();
  let updatedId;
  try {
    await session.withTransaction(async () => {
      const request = await BorrowRequest.findById(req.params.id).session(session);
      if (!request) {
        throw new HttpError(404, 'Borrow request not found.');
      }

      if (request.status === status) {
        updatedId = request._id;
        return;
      }

      if (request.status === 'returned' && status !== 'returned') {
        const stockUpdate = await Book.updateOne(
          { _id: request.book, availableCopies: { $gt: 0 } },
          { $inc: { availableCopies: -1 } },
          { session },
        );
        if (stockUpdate.modifiedCount !== 1) {
          throw new HttpError(409, 'The returned copy cannot be checked out again because no stock is available.');
        }
      } else if (request.status !== 'returned' && status === 'returned') {
        await Book.updateOne({ _id: request.book }, { $inc: { availableCopies: 1 } }, { session });
      }

      request.status = status;
      if (status === 'returned') {
        request.returnedAt = new Date();
        request.fine = calculateFine(request.dueAt, request.returnedAt);
      } else {
        request.returnedAt = null;
        request.fine = 0;
      }
      await request.save({ session });
      updatedId = request._id;
    });
  } finally {
    await session.endSession();
  }

  const request = await populated(BorrowRequest.findById(updatedId));
  res.json({ borrowRequest: request });
}));

module.exports = router;
