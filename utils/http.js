const mongoose = require('mongoose');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: error.message });
  }

  if (error && error.code === 11000) {
    return res.status(409).json({ error: 'A record with that unique value already exists.' });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'The request body must contain valid JSON.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}

module.exports = { HttpError, asyncHandler, errorHandler };
