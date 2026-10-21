const test = require('node:test');
const assert = require('node:assert/strict');
const {
  bookingOverlapFilter,
  calculateFine,
  isValidDate,
  isValidTime,
} = require('../utils/libraryRules');

const day = 24 * 60 * 60 * 1000;

test('fine is zero on or before the due time', () => {
  const dueAt = new Date('2026-01-10T12:00:00.000Z');
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime())), 0);
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() - 1)), 0);
});

test('fine charges 25 cents for each started overdue day', () => {
  const dueAt = new Date('2026-01-10T12:00:00.000Z');
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + 1)), 0.25);
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + day)), 0.25);
  assert.equal(calculateFine(dueAt, new Date(dueAt.getTime() + day + 1)), 0.5);
});

test('date and time validators accept canonical calendar values only', () => {
  assert.equal(isValidDate('2026-02-28'), true);
  assert.equal(isValidDate('2026-02-30'), false);
  assert.equal(isValidDate('02/28/2026'), false);
  assert.equal(isValidTime('00:00'), true);
  assert.equal(isValidTime('23:59'), true);
  assert.equal(isValidTime('24:00'), false);
  assert.equal(isValidTime('9:30'), false);
});

test('booking conflict filter uses both strict interval-overlap comparisons', () => {
  const date = new Date('2026-03-10T00:00:00.000Z');
  assert.deepEqual(
    bookingOverlapFilter('space-1', date, '10:00', '11:00'),
    {
      space: 'space-1',
      date,
      startTime: { $lt: '11:00' },
      endTime: { $gt: '10:00' },
    },
  );
});
