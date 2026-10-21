const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const FINE_CENTS_PER_DAY = 25;

function calculateFine(dueAt, returnedAt) {
  const overdueMilliseconds = returnedAt.getTime() - dueAt.getTime();
  if (overdueMilliseconds <= 0) {
    return 0;
  }

  const overdueDays = Math.ceil(overdueMilliseconds / MILLISECONDS_PER_DAY);
  return (overdueDays * FINE_CENTS_PER_DAY) / 100;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
  return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function bookingOverlapFilter(space, date, startTime, endTime) {
  return {
    space,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
}

module.exports = {
  bookingOverlapFilter,
  calculateFine,
  isValidDate,
  isValidTime,
};
