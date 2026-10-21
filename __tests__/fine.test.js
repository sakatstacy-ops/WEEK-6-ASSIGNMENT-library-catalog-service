const { calculateFine } = require('../utils/libraryRules');

test('charges fifty cents for a return 24 hours and one minute after the due time', () => {
  const dueAt = new Date('2026-11-01T12:00:00.000Z');
  const returnedAt = new Date('2026-11-02T12:01:00.000Z');

  expect(calculateFine(dueAt, returnedAt)).toBe(0.5);
});
