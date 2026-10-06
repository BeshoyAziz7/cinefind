/**
 * Offline demo catalogue.
 * The app runs with zero configuration using this data; add a TMDB key
 * (VITE_TMDB_API_KEY) and the same shapes are filled from the live API.
 * Titles/summaries here are original placeholder text, not TMDB content.
 */

const RAW = [
  ['Neon Harbor', 2024, 8.4, 'Sci-Fi', 'A dock worker on a flooded megacity finds a signal buried under the tide line — and the city starts answering back.', 199, 'TV-MA'],
  ['The Long Quiet', 2023, 7.9, 'Drama', 'Two estranged sisters spend one winter restoring their late father’s radio station, and everything they never said.', 128, 'PG-13'],
  ['Ironwake', 2025, 8.1, 'Action', 'A retired demolitions expert is pulled back for one night of work that never actually ends.', 141, 'R'],
  ['Paper Lions', 2022, 7.2, 'Comedy', 'A failing improv troupe accidentally becomes the most trusted news source in their town.', 104, 'PG-13'],
  ['Hollow Signal', 2024, 8.8, 'Thriller', 'Every night at 3:14 the emergency broadcast plays a name. Tonight it plays hers.', 117, 'TV-MA'],
  ['Saltwater Kings', 2023, 7.6, 'Drama', 'Three generations of a fishing family fight the sea, the bank, and each other.', 136, 'PG-13'],
  ['Vector Bloom', 2025, 8.9, 'Sci-Fi', 'A botanist engineers a plant that remembers. It remembers more than she planted.', 152, 'PG-13'],
  ['Midnight Cartography', 2021, 7.4, 'Adventure', 'A cartographer maps streets that only exist between 1am and dawn.', 121, 'PG'],
  ['Gravel & Gold', 2024, 7.8, 'Western', 'A rail surveyor and a thief share the last horse out of a town that burned yesterday.', 133, 'R'],
  ['The Fifth Tenant', 2023, 8.2, 'Horror', 'Four apartments. Four neighbours. One lease that nobody remembers signing.', 99, 'R'],
  ['Understudy', 2022, 7.1, 'Comedy', 'She has learned every line of a play she will never be cast in — until opening night goes wrong.', 96, 'PG-13'],
  ['Cobalt Hours', 2025, 8.5, 'Thriller', 'A night-shift translator hears something in the tape that was never said out loud.', 124, 'TV-MA'],
  ['Lantern Season', 2024, 8.0, 'Family', 'A village lights one lantern for every person who left. This year, one comes back.', 108, 'PG'],
  ['Static Garden', 2023, 7.7, 'Sci-Fi', 'The last analog television in the world is picking up a channel from somewhere green.', 113, 'PG-13'],
  ['Ninety Winters', 2021, 8.6, 'Drama', 'An ice climber recounts the one ascent she has never described to anyone.', 145, 'PG-13'],
  ['Backfire Road', 2025, 7.3, 'Action', 'A getaway driver who has never once been caught takes a passenger who has never once been honest.', 111, 'R'],
  ['The Quiet Hour Club', 2022, 7.9, 'Comedy', 'A support group for insomniacs becomes the most productive company in the city.', 101, 'PG-13'],
  ['Deepcut', 2024, 8.3, 'Thriller', 'A sound engineer restoring a lost album finds a confession mixed under the bass.', 119, 'TV-MA'],
  ['Cinder & Signal', 2023, 8.7, 'Sci-Fi', 'After the towers fall silent, a teenager rebuilds the network one rooftop at a time.', 138, 'PG-13'],
  ['Marrow Lake', 2025, 7.5, 'Horror', 'The lake gives back everything it takes. Eventually.', 94, 'R'],
  ['Orchard of Small Hours', 2022, 8.1, 'Drama', 'A widowed beekeeper and the tax inspector sent to seize her land.', 129, 'PG'],
  ['Redline Sonata', 2024, 7.8, 'Action', 'A concert pianist moonlights as a courier through six cities in one night.', 116, 'R'],
  ['Foxglove Protocol', 2023, 8.4, 'Thriller', 'Her handler has been dead for nine years. Her orders keep arriving.', 127, 'TV-MA'],
  ['Weather for Nobody', 2021, 7.6, 'Comedy', 'A forecaster for an uninhabited island files reports anyway. Someone is reading them.', 89, 'PG'],
  ['Halcyon Drift', 2025, 8.8, 'Sci-Fi', 'A generation ship wakes its crew four hundred years early, and won’t say why.', 158, 'PG-13'],
  ['Bone China', 2024, 7.4, 'Horror', 'The dinner service has been in the family six generations. So has the guest.', 97, 'R'],
  ['Northbound Nine', 2023, 8.0, 'Adventure', 'Nine strangers, one freight train, and a border that closes at dawn.', 132, 'PG-13'],
  ['The Understory', 2025, 8.2, 'Drama', 'A forest ecologist returns to the woods she testified against.', 140, 'PG-13'],
];

/* Deterministic poster gradients so the offline build still looks designed. */
const HUES = [
  ['#7f1d1d', '#e11d48'], ['#1e1b4b', '#4338ca'], ['#064e3b', '#059669'],
  ['#78350f', '#f59e0b'], ['#0c4a6e', '#0891b2'], ['#3b0764', '#a855f7'],
  ['#450a0a', '#f97316'], ['#0f172a', '#334155'], ['#4a044e', '#db2777'],
  ['#1c1917', '#a16207'],
];

export const CATALOGUE = RAW.map((r, i) => {
  const [title, year, rating, genre, overview, runtime, cert] = r;
  return {
    id: 1000 + i,
    title,
    year,
    rating,
    genre,
    genres: [genre, i % 3 === 0 ? 'Suspense' : 'Character Study'],
    overview,
    runtime,
    cert,
    posterUrl: null,
    backdropUrl: null,
    gradient: HUES[i % HUES.length],
    trailerKey: null,
    cast: ['Ada Merrow', 'Tobias Vane', 'Ines Okafor', 'Ruben Castellanos', 'Mira Lindqvist']
      .slice(0, 3 + (i % 3)),
    match: 72 + ((i * 7) % 27),
  };
});

const byGenre = (g) => CATALOGUE.filter((m) => m.genre === g);
const pick = (...idx) => idx.map((i) => CATALOGUE[i % CATALOGUE.length]);

export const MOCK_ROWS = [
  { id: 'trending', title: 'Trending Now', items: pick(4, 6, 18, 24, 11, 2, 17, 22, 9, 14) },
  { id: 'top', title: 'Top Rated This Year', items: [...CATALOGUE].sort((a, b) => b.rating - a.rating).slice(0, 10) },
  { id: 'scifi', title: 'Sci-Fi & Beyond', items: [...byGenre('Sci-Fi'), ...pick(7, 26, 12, 19)] },
  { id: 'thriller', title: 'Edge of Your Seat', items: [...byGenre('Thriller'), ...byGenre('Horror')] },
  { id: 'drama', title: 'Quietly Devastating', items: [...byGenre('Drama'), ...pick(20, 27, 12)] },
  { id: 'comedy', title: 'Laugh Track Optional', items: [...byGenre('Comedy'), ...pick(23, 3, 16)] },
  { id: 'action', title: 'Full Throttle', items: [...byGenre('Action'), ...byGenre('Adventure'), ...byGenre('Western')] },
];

export const MOCK_CONTINUE = pick(6, 4, 14, 18, 21, 9).map((m, i) => ({
  ...m,
  progress: [68, 24, 91, 12, 47, 78][i],
}));

export const MOCK_FEATURED = CATALOGUE[24]; // Halcyon Drift
