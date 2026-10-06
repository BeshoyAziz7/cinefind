import { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroCarouselSection from './components/HeroCarouselSection.tsx';
import MovieCard from './components/MovieCard.jsx';
import DetailModal from './components/DetailModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import { IconSearch } from './components/Icons.jsx';
import { fetchHome, searchTitles, fetchByGenre, GENRE_LIST, LIVE } from './lib/tmdb.js';
import { RowSkeleton } from './components/Row.jsx';
import CoverflowRow from './components/CoverflowRow.tsx';
import { useMyList, useDebounced, useToasts, useScrollGlow } from './hooks/index.js';
import GenreView from './components/GenreView.jsx';
import GridCard from './components/GridCard.jsx';
import { Footer } from './components/ui/footer-section.tsx';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';

import './App.css';

export default function App() {
  const [home, setHome] = useState({ featured: null, continueWatching: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [activeGenre, setActiveGenre] = useState(null);
  const [genreItems, setGenreItems] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);

  const [genreSort, setGenreSort] = useState('popular');


  const { list, has, toggle } = useMyList();
  const { toasts, push } = useToasts();
  const debouncedQuery = useDebounced(query, 320);
  const reduceMotion = useReducedMotion();


  useScrollGlow();


  useEffect(() => {
    let alive = true;
    fetchHome()
      .then((data) => alive && setHome(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    let alive = true;
    setSearching(true);
    searchTitles(debouncedQuery).then((r) => {
      if (!alive) return;
      setResults(r);
      setSearching(false);
    });
    return () => {
      alive = false;
    };
  }, [debouncedQuery]);

  // Fetch every title in the selected category. Cleared views (activeGenre null) fetch nothing.
  useEffect(() => {
    if (!activeGenre) {
      setGenreItems([]);
      return;
    }
    let alive = true;
    setGenreLoading(true);
    fetchByGenre(activeGenre).then((items) => {
      if (!alive) return;
      setGenreItems(items);
      setGenreLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [activeGenre]);


  const searchActive = query.trim().length > 0;

  const viewKey = searchActive
  ? 'search'
  : activeGenre
  ? `genre-${activeGenre}`
  : tab === 'My List'
  ? 'my-list'
  : 'home';

  /* Category browsing, search, and tabs are three views of the same page —
  picking one clears the others so the header always matches what's shown. */
  const handleGenre = useCallback((name) => {
  setActiveGenre(name);
  if (name) setQuery('');
  setGenreSort('popular');
  }, []);

  const handleQuery = useCallback((q) => {
    setQuery(q);
    if (q) setActiveGenre(null);
  }, []);

  const handleTab = useCallback((t) => {
    setTab(t);
    setActiveGenre(null);
  }, []);

  const openDetails = useCallback((item) => {
    setAutoplay(false);
    setSelected(item);
  }, []);

  const playTrailer = useCallback((item) => {
    setAutoplay(true);
    setSelected(item);
  }, []);

  const toggleList = useCallback(
    (item) => {
      const added = toggle(item);
      push(added ? `Added "${item.title}" to My List` : `Removed "${item.title}"`);
    },
    [toggle, push],
  );

  const sortedGenreItems = useMemo(() => {
  const arr = [...genreItems];
  if (genreSort === 'rating') return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (genreSort === 'year') return arr.sort((a, b) => (b.year || 0) - (a.year || 0));
  if (genreSort === 'az') return arr.sort((a, b) => a.title.localeCompare(b.title));
  return arr; // 'popular' — keep original order
  }, [genreItems, genreSort]);

  /* Tabs filter the same catalogue rather than refetching. */
  const visibleRows = useMemo(() => {
    if (tab === 'New & Popular') return home.rows.filter((r) => ['trending', 'top'].includes(r.id));
    if (tab === 'Series') return home.rows.filter((r) => ['drama', 'thriller', 'comedy'].includes(r.id));
    if (tab === 'Films') return home.rows.filter((r) => ['action', 'scifi', 'top'].includes(r.id));
    return home.rows;
  }, [tab, home.rows]);

    const heroItems = useMemo(() => {
    if (!home.featured) return [];
    const spotlight = home.rows.find((r) => r.id === 'trending')?.items || [];
    const merged = [home.featured, ...spotlight].filter(
      (item, i, arr) => arr.findIndex((x) => x.id === item.id) === i,
    );
    return merged.slice(0, 8);
  }, [home.featured, home.rows]);



  return (
    <LayoutGroup>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Navbar
        tab={tab}
        onTab={handleTab}
        query={query}
        onQuery={handleQuery}
        listCount={list.length}
        onSignIn={() => setAuthOpen(true)}
        genres={GENRE_LIST}
        activeGenre={activeGenre}
        onGenre={handleGenre}
      />

      <main id="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {searchActive ? (
              <section className="search-view">
                <h1 className="search-heading">
                  Results for <span>{query}</span>
                </h1>
                {searching ? (
                  <div className="search-grid">
                    {Array.from({ length: 12 }, (_, i) => (
                      <span key={i} className="sk" style={{ aspectRatio: '2 / 3' }} />
                    ))}
                  </div>
                ) : results.length ? (
                  <div className="search-grid">
                    {results.map((item, i) => (
                      <div key={item.id} className="search-cell" style={{ '--i': i }}>
                        <MovieCard
                          item={item}
                          index={i}
                          onOpen={openDetails}
                          onPlay={playTrailer}
                          onToggleList={toggleList}
                          inList={has(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <IconSearch size={34} />
                    <p className="empty-title">Nothing matched that</p>
                    <p className="empty-sub">
                      Try a different title, or browse by genre from the rows on the home page.
                    </p>
                    <button type="button" className="btn btn-ghost" onClick={() => setQuery('')}>
                      Clear search
                    </button>
                  </div>
                )}
              </section>
            ) : activeGenre ? (
              <GenreView
                genre={activeGenre}
                items={sortedGenreItems}
                loading={genreLoading}
                sort={genreSort}
                onSortChange={setGenreSort}
                onOpen={openDetails}
                onPlay={playTrailer}
                onToggleList={toggleList}
                hasInList={has}
                onClear={() => handleGenre(null)}
              />
            ) : tab === 'My List' ? (
              <section className="list-view">
                <h1 className="search-heading">My List</h1>
                {list.length ? (
                  <div className="genre-grid">
                    {list.map((item, i) => (
                      <GridCard
                        key={item.id}
                        item={item}
                        index={i}
                        onOpen={openDetails}
                        onPlay={playTrailer}
                        onToggleList={toggleList}
                        inList
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <p className="empty-title">Your list is empty</p>
                    <p className="empty-sub">
                      Hit the + on any title and it will be waiting here next time you visit.
                    </p>
                    <button type="button" className="btn btn-accent" onClick={() => setTab('Home')}>
                      Browse titles
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <>
                <div className="hero-carousel-wrap">                  
                  <HeroCarouselSection
                    items={heroItems}
                    loading={loading}
                    onPlay={playTrailer}
                    onOpen={openDetails}
                    onToggleList={toggleList}
                    hasInList={has}
                  />
                </div>

                <div className="rows">                  
                  {loading ? (
                    <>
                      <RowSkeleton />
                      <RowSkeleton />
                      <RowSkeleton />
                    </>
                  ) : (
                    <>
                      {tab === 'Home' && home.continueWatching.length > 0 && (
                        <CoverflowRow
                          title="Continue Watching"
                          items={home.continueWatching}
                          showProgress
                          onOpen={openDetails}
                          onPlay={playTrailer}
                          onToggleList={toggleList}
                          hasInList={has}
                        />
                      )}

                      {list.length > 0 && tab === 'Home' && (
                        <CoverflowRow
                          title="My List"
                          items={list}
                          onOpen={openDetails}
                          onPlay={playTrailer}
                          onToggleList={toggleList}
                          hasInList={has}
                        />
                      )}

                      {visibleRows.map((row) => (
                        <CoverflowRow
                          key={row.id}
                          title={row.title}
                          items={row.items}
                          onOpen={openDetails}
                          onPlay={playTrailer}
                          onToggleList={toggleList}
                          hasInList={has}
                        />
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

<Footer
  note={
    <>
      A movie discovery interface.{' '}
      {LIVE ? 'Live data from TMDB.' : 'Running on the bundled demo catalogue — add a TMDB key for live data.'}{' '}
      Playback is limited to official trailers.
      <br />
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </>
  }
/>

      <AnimatePresence>
        {selected && (
          <DetailModal
            key={selected.id}
            item={selected}
            startPlaying={autoplay}
            onClose={() => setSelected(null)}
            onOpen={openDetails}
            onToggleList={toggleList}
            hasInList={has}
          />
        )}
      </AnimatePresence>
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onDone={(msg) => {
            setAuthOpen(false);
            push(msg);
          }}
        />
      )}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
      </LayoutGroup>
  );
}