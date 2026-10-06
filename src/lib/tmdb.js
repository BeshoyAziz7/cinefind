/**
 * TMDB data layer.
 *
 * Set VITE_TMDB_API_KEY in .env.local to use live data.
 * With no key the app falls back to the bundled demo catalogue so the UI
 * always renders — never a blank screen (ux-guidelines: Loading States).
 */
import { CATALOGUE, MOCK_ROWS, MOCK_CONTINUE, MOCK_FEATURED } from './mockData.js';

const KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TMDB_API_KEY) || '';
export const LIVE = Boolean(KEY);

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

const GENRE_IDS = {
  Action: 28, Adventure: 12, Comedy: 35, Drama: 18,
  Horror: 27, 'Sci-Fi': 878, Thriller: 53, Family: 10751, Western: 37,
};

const GENRE_NAMES = Object.fromEntries(Object.entries(GENRE_IDS).map(([k, v]) => [v, k]));

/** Category list for the navbar dropdown, in a fixed display order. */
export const GENRE_LIST = ['Action', 'Adventure', 'Comedy', 'Drama', 'Family', 'Horror', 'Sci-Fi', 'Thriller', 'Western'];

/** Normalise a TMDB movie into the shape every component consumes. */
function normalise(m, i = 0) {
  const names = (m.genre_ids || []).map((g) => GENRE_NAMES[g]).filter(Boolean);
  return {
    id: m.id,
    title: m.title || m.name || 'Untitled',
    year: Number((m.release_date || m.first_air_date || '').slice(0, 4)) || null,
    rating: Math.round((m.vote_average || 0) * 10) / 10,
    genre: names[0] || 'Feature',
    genres: names.length ? names.slice(0, 3) : ['Feature'],
    overview: m.overview || 'No synopsis available for this title yet.',
    runtime: m.runtime || null,
    cert: m.adult ? 'R' : 'PG-13',
    posterUrl: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    backdropUrl: m.backdrop_path ? `${IMG}/original${m.backdrop_path}` : null,
    gradient: CATALOGUE[i % CATALOGUE.length].gradient,
    trailerKey: null,
    cast: [],
    match: 60 + Math.round((m.vote_average || 0) * 4),
  };
}

async function get(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set('api_key', KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Home payload: featured hero, continue-watching, and category rows. */
export async function fetchHome() {
  if (!LIVE) {
    await wait(700); // let the skeletons actually show in the demo build
    return { featured: MOCK_FEATURED, continueWatching: MOCK_CONTINUE, rows: MOCK_ROWS };
  }

  const wanted = [
    ['trending', 'Trending Now', () => get('/trending/movie/week')],
    ['top', 'Top Rated', () => get('/movie/top_rated')],
    ['scifi', 'Sci-Fi & Beyond', () => get('/discover/movie', { with_genres: GENRE_IDS['Sci-Fi'], sort_by: 'popularity.desc' })],
    ['thriller', 'Edge of Your Seat', () => get('/discover/movie', { with_genres: GENRE_IDS.Thriller, sort_by: 'popularity.desc' })],
    ['drama', 'Quietly Devastating', () => get('/discover/movie', { with_genres: GENRE_IDS.Drama, sort_by: 'vote_average.desc', 'vote_count.gte': 800 })],
    ['comedy', 'Laugh Track Optional', () => get('/discover/movie', { with_genres: GENRE_IDS.Comedy, sort_by: 'popularity.desc' })],
    ['action', 'Full Throttle', () => get('/discover/movie', { with_genres: GENRE_IDS.Action, sort_by: 'popularity.desc' })],
  ];

  const settled = await Promise.allSettled(wanted.map(([, , fn]) => fn()));
  const rows = settled
    .map((s, i) => ({
      id: wanted[i][0],
      title: wanted[i][1],
      items: s.status === 'fulfilled' ? (s.value.results || []).map(normalise) : [],
    }))
    .filter((r) => r.items.length);

  if (!rows.length) return { featured: MOCK_FEATURED, continueWatching: MOCK_CONTINUE, rows: MOCK_ROWS };

  const pool = rows[0].items;
  const featured = pool.find((m) => m.backdropUrl) || pool[0];
  const continueWatching = (rows[1]?.items || pool)
    .slice(0, 6)
    .map((m, i) => ({ ...m, progress: [68, 24, 91, 12, 47, 78][i] }));

  return { featured, continueWatching, rows };
}

/** Details + trailer + cast, fetched only when a title is opened. */
export async function fetchDetails(item) {
  if (!LIVE) {
    await wait(280);
    return { ...item, similar: CATALOGUE.filter((m) => m.id !== item.id).slice(0, 6) };
  }
  try {
    const data = await get(`/movie/${item.id}`, { append_to_response: 'videos,credits,similar' });
    const yt = (data.videos?.results || []).find(
      (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
    );
    return {
      ...item,
      runtime: data.runtime || item.runtime,
      overview: data.overview || item.overview,
      genres: (data.genres || []).map((g) => g.name).slice(0, 3),
      trailerKey: yt ? yt.key : null,
      cast: (data.credits?.cast || []).slice(0, 6).map((c) => c.name),
      similar: (data.similar?.results || []).slice(0, 6).map(normalise),
    };
  } catch {
    return { ...item, similar: [] };
  }
}

/** Every title in one genre, for the "browse by category" dropdown. */
export async function fetchByGenre(name) {
  if (!LIVE) {
    await wait(260);
    return CATALOGUE.filter((m) => m.genre === name || m.genres.includes(name));
  }
  const id = GENRE_IDS[name];
  if (!id) return [];
  try {
    // TMDB discover pages at 20 results; pull two pages for a fuller shelf.
    const [p1, p2] = await Promise.allSettled([
      get('/discover/movie', { with_genres: id, sort_by: 'popularity.desc', page: 1 }),
      get('/discover/movie', { with_genres: id, sort_by: 'popularity.desc', page: 2 }),
    ]);
    const results = [
      ...(p1.status === 'fulfilled' ? p1.value.results || [] : []),
      ...(p2.status === 'fulfilled' ? p2.value.results || [] : []),
    ];
    return results.map(normalise);
  } catch {
    return [];
  }
}

/** Debounced search is handled by the caller; this is the raw query. */
export async function searchTitles(query) {
  const q = query.trim();
  if (!q) return [];
  if (!LIVE) {
    await wait(220);
    const needle = q.toLowerCase();
    return CATALOGUE.filter(
      (m) =>
        m.title.toLowerCase().includes(needle) ||
        m.genre.toLowerCase().includes(needle) ||
        m.overview.toLowerCase().includes(needle),
    );
  }
  try {
    const data = await get('/search/movie', { query: q, include_adult: 'false' });
    return (data.results || []).map(normalise);
  } catch {
    return [];
  }
}
