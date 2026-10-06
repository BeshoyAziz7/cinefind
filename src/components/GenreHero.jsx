import { motion } from 'framer-motion';
import { IconChevron, IconStar } from './Icons.jsx';

const EASE = [0.22, 1, 0.36, 1];

const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'year', label: 'Newest' },
  { id: 'az', label: 'A–Z' },
];

export default function GenreHero({ genre, items, sort, onSortChange, onBack }) {
  const heroItem = items.find((i) => i.backdropUrl) || items[0];
  const heroImage = heroItem?.backdropUrl || heroItem?.posterUrl || null;
  const [from, to] = heroItem?.gradient || ['#1c1917', '#44403c'];

  const avgRating = items.length
    ? (items.reduce((sum, m) => sum + (m.rating || 0), 0) / items.length).toFixed(1)
    : null;

  const words = genre.split(' ');

  return (
    <div className="genre-hero" style={{ '--from': from, '--to': to }}>
      {heroImage ? (
        <img className="genre-hero-bg" src={heroImage} alt="" aria-hidden="true" />
      ) : (
        <div className="genre-hero-plate" aria-hidden="true" />
      )}
      <div className="genre-hero-scrim" aria-hidden="true" />
      <div className="genre-hero-grain" aria-hidden="true" />

      <div className="genre-hero-content">
        <button type="button" className="genre-back" onClick={onBack}>
          <IconChevron dir="left" size={15} /> All Categories
        </button>

        <p className="genre-eyebrow">Category</p>

        <h1 className="genre-title">
          {words.map((w, i) => (
            <span className="genre-title-word-mask" key={i}>
              <motion.span
                className="genre-title-word"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 + i * 0.07, ease: EASE }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="genre-meta-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        >
          <span className="genre-stat">
            <strong>{items.length}</strong> title{items.length === 1 ? '' : 's'}
          </span>
          {avgRating && (
            <span className="genre-stat">
              <IconStar size={13} /> <strong>{avgRating}</strong> avg rating
            </span>
          )}

          <div className="genre-sort" role="tablist" aria-label="Sort titles">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={sort === s.id}
                className={`genre-sort-btn ${sort === s.id ? 'is-active' : ''}`}
                onClick={() => onSortChange(s.id)}
              >
                {sort === s.id && (
                  <motion.span
                    className="genre-sort-pill"
                    layoutId="genre-sort-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}