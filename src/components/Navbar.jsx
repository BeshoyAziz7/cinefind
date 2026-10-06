import { useState, useEffect, useRef } from 'react';
import { IconSearch, IconClose, IconMenu, IconChevron } from './Icons.jsx';
import { useNavScroll } from '../hooks/index.js';
import './Navbar.css';

const TABS = ['Home', 'Series', 'Films', 'New & Popular', 'My List'];

/**
 * Top bar. Transparent and full-width over the hero at rest.
 * Scrolling down morphs it into a floating glass pill and tucks the tab
 * row behind the burger; scrolling back up restores it instantly —
 * the same "morphing scroll navbar" interaction, wired to CineFind's
 * real navigation instead of anchor links.
 */
export default function Navbar({
  tab,
  onTab,
  query,
  onQuery,
  listCount,
  onSignIn,
  genres = [],
  activeGenre,
  onGenre,
}) {
  const { atTop, direction, progress } = useNavScroll();
  const floating = !atTop;
  const compact = floating && direction === 'down';

  const [searchOpen, setSearchOpen] = useState(Boolean(query));
  const [menuOpen, setMenuOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const inputRef = useRef(null);
  const genreRef = useRef(null);
  const prevCompactRef = useRef(compact);
  const [suppressTabsAnim, setSuppressTabsAnim] = useState(false);

  useEffect(() => {
  if (prevCompactRef.current === compact) return;
  prevCompactRef.current = compact;
  setSuppressTabsAnim(true);
  const raf = requestAnimationFrame(() => {
    requestAnimationFrame(() => setSuppressTabsAnim(false));
  });
  return () => cancelAnimationFrame(raf);
}, [compact]);



  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // If the shell re-expands (scrolled back up, or reached the top),
  // don't leave a stale open drawer behind.
  useEffect(() => {
    if (!compact) setMenuOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!genreOpen) return;
    const onDown = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) setGenreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setGenreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [genreOpen]);

  const closeSearch = () => {
    onQuery('');
    setSearchOpen(false);
  };

  const pickGenre = (name) => {
    onGenre(name);
    setGenreOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <nav
        className={`nav ${floating ? 'is-floating' : ''} ${compact ? 'is-compact' : ''}`}
        aria-label="Primary"
      >
        <div className="nav-shell">
          <button
            type="button"
            className="nav-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>

          <a className="nav-logo" href="#main" onClick={() => onTab('Home')}>
            Cine<span>Find</span>
          </a>

          <ul className={`nav-tabs ${menuOpen ? 'is-open' : ''} ${suppressTabsAnim ? 'no-anim' : ''}`}>
            {TABS.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  className={`nav-tab ${tab === t && !activeGenre ? 'is-active' : ''}`}
                  aria-current={tab === t && !activeGenre ? 'page' : undefined}
                  onClick={() => {
                    onTab(t);
                    setMenuOpen(false);
                  }}
                >
                  {t}
                  {t === 'My List' && listCount > 0 && <span className="nav-pill">{listCount}</span>}
                </button>
              </li>
            ))}

            <li className="nav-genre" ref={genreRef}>
              <button
                type="button"
                className={`nav-tab nav-genre-btn ${activeGenre ? 'is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={genreOpen}
                onClick={() => setGenreOpen((v) => !v)}
              >
                {activeGenre || 'Categories'}
                <IconChevron size={14} dir={genreOpen ? 'up' : 'down'} />
              </button>

              <ul className={`nav-genre-menu ${genreOpen ? 'is-open' : ''}`} role="menu">
                {genres.map((g) => (
                  <li key={g} role="none">
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={activeGenre === g}
                      className={`nav-genre-item ${activeGenre === g ? 'is-active' : ''}`}
                      onClick={() => pickGenre(g)}
                    >
                      {g}
                    </button>
                  </li>
                ))}
                {activeGenre && (
                  <li role="none" className="nav-genre-clear-wrap">
                    <button type="button" className="nav-genre-clear" onClick={() => pickGenre(null)}>
                      Clear category
                    </button>
                  </li>
                )}
              </ul>
            </li>
          </ul>

          <div className="nav-right">
            <div className={`nav-search ${searchOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="nav-search-btn"
                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                aria-label={searchOpen ? 'Close search' : 'Open search'}
              >
                {searchOpen ? <IconClose size={18} /> : <IconSearch size={18} />}
              </button>
              <input
                ref={inputRef}
                type="search"
                className="nav-search-input"
                placeholder="Titles, genres, people"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                tabIndex={searchOpen ? 0 : -1}
                aria-label="Search titles"
              />
            </div>

            <button type="button" className="nav-avatar" onClick={onSignIn}>
              <span className="nav-avatar-face" aria-hidden="true" />
              <span className="nav-avatar-label">Sign in</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}