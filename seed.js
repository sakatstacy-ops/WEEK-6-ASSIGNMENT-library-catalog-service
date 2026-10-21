require('dotenv').config();

const mongoose = require('mongoose');
const Book = require('./models/Book');
const Genre = require('./models/Genre');
const Space = require('./models/Space');

const genres = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Historical Fiction', slug: 'historical-fiction' },
  { name: 'Contemporary Fiction', slug: 'contemporary-fiction' },
];

const books = [
  { title: 'The Glass Meridian', author: 'Mira Ellison', isbn: '9781234567897', description: 'A cartographer charts a route through a city that shifts each night.', coverImage: 'https://images.example.com/books/glass-meridian.jpg', totalCopies: 8, availableCopies: 6, genre: 'science-fiction' },
  { title: 'Orbit of Ash', author: 'Jonah Vale', isbn: '9781234567903', description: 'A salvage pilot finds a signal hidden in the debris of an old colony.', coverImage: 'https://images.example.com/books/orbit-of-ash.jpg', totalCopies: 6, availableCopies: 2, genre: 'science-fiction' },
  { title: 'The Quiet Engine', author: 'S. R. Kade', isbn: '9781234567910', description: 'Engineers on a remote moon investigate a machine that predicts disasters.', coverImage: 'https://images.example.com/books/quiet-engine.jpg', totalCopies: 5, availableCopies: 5, genre: 'science-fiction' },
  { title: 'A Map of Red Stars', author: 'Leonie Hart', isbn: '9781234567927', description: 'Two siblings search a terraformed planet for their missing survey team.', coverImage: 'https://images.example.com/books/map-red-stars.jpg', totalCopies: 7, availableCopies: 4, genre: 'science-fiction' },
  { title: 'The Thorn Archive', author: 'Nadia Wren', isbn: '9781234567934', description: 'An apprentice archivist discovers a forbidden history woven into living vines.', coverImage: 'https://images.example.com/books/thorn-archive.jpg', totalCopies: 9, availableCopies: 7, genre: 'fantasy' },
  { title: 'Crown of Salt', author: 'Elias Morcant', isbn: '9781234567941', description: 'A coastal kingdom chooses its next ruler through an ancient sea trial.', coverImage: 'https://images.example.com/books/crown-of-salt.jpg', totalCopies: 6, availableCopies: 3, genre: 'fantasy' },
  { title: 'The Lantern Keeper', author: 'Priya Rowan', isbn: '9781234567958', description: 'A keeper of mountain lanterns protects travelers from the winter dark.', coverImage: 'https://images.example.com/books/lantern-keeper.jpg', totalCopies: 4, availableCopies: 4, genre: 'fantasy' },
  { title: 'A Clockwork Orchard', author: 'T. M. Fen', isbn: '9781234567965', description: 'A young mechanic inherits an orchard where each tree grows a different hour.', coverImage: 'https://images.example.com/books/clockwork-orchard.jpg', totalCopies: 8, availableCopies: 5, genre: 'fantasy' },
  { title: 'The Last Blue Envelope', author: 'Celia North', isbn: '9781234567972', description: "A postmark from decades ago reopens a small town's unsolved disappearance.", coverImage: 'https://images.example.com/books/last-blue-envelope.jpg', totalCopies: 7, availableCopies: 6, genre: 'mystery' },
  { title: 'Murder at Bellweather Pier', author: 'Graham Pike', isbn: '9781234567989', description: 'A harbor inspector untangles a murder among the guests of a storm-bound hotel.', coverImage: 'https://images.example.com/books/bellweather-pier.jpg', totalCopies: 5, availableCopies: 1, genre: 'mystery' },
  { title: 'The Fifth Key', author: 'Amara Quinn', isbn: '9781234567996', description: 'A locksmith is asked to open a safe that was sealed before the city was built.', coverImage: 'https://images.example.com/books/fifth-key.jpg', totalCopies: 6, availableCopies: 4, genre: 'mystery' },
  { title: 'A Study in Winter Glass', author: 'R. L. Mercer', isbn: '9781234568009', description: 'A museum conservator traces a forged painting to a vanished mountain village.', coverImage: 'https://images.example.com/books/winter-glass.jpg', totalCopies: 5, availableCopies: 5, genre: 'mystery' },
  { title: 'Letters from the Indigo Road', author: 'Beatrice Cole', isbn: '9781234568016', description: 'A family follows a bundle of letters across the American frontier in 1868.', coverImage: 'https://images.example.com/books/indigo-road.jpg', totalCopies: 8, availableCopies: 6, genre: 'historical-fiction' },
  { title: 'The Clockmaker of Isfahan', author: 'Darius Nouri', isbn: '9781234568023', description: 'An apprentice builds an astronomical clock amid the upheavals of 17th-century Persia.', coverImage: 'https://images.example.com/books/clockmaker-isfahan.jpg', totalCopies: 6, availableCopies: 3, genre: 'historical-fiction' },
  { title: 'Harbor of Paper Birds', author: 'Lotte Voss', isbn: '9781234568030', description: 'A printmaker shelters displaced families in a northern port during wartime.', coverImage: 'https://images.example.com/books/paper-birds.jpg', totalCopies: 7, availableCopies: 7, genre: 'historical-fiction' },
  { title: 'The Orchard at Dawn', author: 'Mina Bell', isbn: '9781234568047', description: "Three generations return to their family's farm to decide what should come next.", coverImage: 'https://images.example.com/books/orchard-at-dawn.jpg', totalCopies: 9, availableCopies: 8, genre: 'contemporary-fiction' },
  { title: 'Small Hours in June', author: 'Caleb Reyes', isbn: '9781234568054', description: 'A night-shift radio host reconnects with the neighbors in his apartment building.', coverImage: 'https://images.example.com/books/small-hours-june.jpg', totalCopies: 5, availableCopies: 2, genre: 'contemporary-fiction' },
  { title: 'The Borrowed Kitchen', author: 'Ada Monroe', isbn: '9781234568061', description: 'A community cooking class helps a recently widowed chef begin again.', coverImage: 'https://images.example.com/books/borrowed-kitchen.jpg', totalCopies: 6, availableCopies: 6, genre: 'contemporary-fiction' },
  { title: 'Where the Train Turns', author: 'Owen Park', isbn: '9781234568078', description: 'Two former friends meet again on a rural rail line at a crossroads in their lives.', coverImage: 'https://images.example.com/books/train-turns.jpg', totalCopies: 4, availableCopies: 3, genre: 'contemporary-fiction' },
  { title: 'A Room for the Rain', author: 'Sana Whitaker', isbn: '9781234568085', description: 'A visiting architect finds unexpected community while restoring a flooded library.', coverImage: 'https://images.example.com/books/room-for-rain.jpg', totalCopies: 7, availableCopies: 5, genre: 'contemporary-fiction' },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Set MONGODB_URI in your .env file before running the seed script.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Book.deleteMany({});
  await Genre.deleteMany({});

  const insertedGenres = await Genre.insertMany(genres);
  const genreIdsBySlug = new Map(insertedGenres.map((genre) => [genre.slug, genre._id]));
  const booksWithGenreIds = books.map(({ genre, ...book }) => ({
    ...book,
    genre: genreIdsBySlug.get(genre),
  }));

  await Book.insertMany(booksWithGenreIds);
  await Space.updateOne(
    { name: 'Reading Room A' },
    {
      $setOnInsert: {
        name: 'Reading Room A',
        description: 'Quiet study room for individual or small-group use.',
        active: true,
      },
    },
    { upsert: true },
  );
  console.log(`Seeded ${insertedGenres.length} genres, ${booksWithGenreIds.length} books, and a demo booking space.`);
}

seed()
  .catch((error) => {
    console.error('Catalog seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });