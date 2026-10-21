const {
  bookingOverlapFilter,
  calculateFine,
  isValidDate,
  isValidTime,
} = require('../utils/libraryRules');

describe('library business rules', () => {
  test('fine is zero on or before the due time', () => {
    const dueAt = new Date('2026-01-10T12:00:00.000Z');
    expect(calculateFine(dueAt, new Date(dueAt.getTime()))).toBe(0);
    expect(calculateFine(dueAt, new Date(dueAt.getTime() - 1))).toBe(0);
  });

  test('fine charges 25 cents for each started overdue day', () => {
    const dueAt = new Date('2026-01-10T12:00:00.000Z');
    const day = 24 * 60 * 60 * 1000;
    expect(calculateFine(dueAt, new Date(dueAt.getTime() + 1))).toBe(0.25);
    expect(calculateFine(dueAt, new Date(dueAt.getTime() + day))).toBe(0.25);
    expect(calculateFine(dueAt, new Date(dueAt.getTime() + day + 1))).toBe(0.5);
  });

  test('date and time validators accept canonical calendar values only', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('02/28/2026')).toBe(false);
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('9:30')).toBe(false);
  });

  test('booking conflict filter checks strict start and end intersections', () => {
    const date = new Date('2026-03-10T00:00:00.000Z');
    expect(bookingOverlapFilter('space-1', date, '10:00', '11:00')).toEqual({
      space: 'space-1',
      date,
      startTime: { $lt: '11:00' },
      endTime: { $gt: '10:00' },
    });
  });
});
