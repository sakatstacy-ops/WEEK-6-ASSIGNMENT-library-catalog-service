const express = require('express');
const Space = require('../models/Space');
const { asyncHandler } = require('../utils/http');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const spaces = await Space.find({ active: true }).sort({ name: 1 });
  res.json({ spaces });
}));

module.exports = router;
