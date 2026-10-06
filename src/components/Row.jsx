import { useRef, useState, useEffect, useCallback, memo } from 'react';
import MovieCard from './MovieCard.jsx';
import { IconChevron } from './Icons.jsx';
import { useReveal } from '../hooks/index.js';
import './Row.css';

/** Skeleton shown while the row's data is in flight. */
export function RowSkeleton({ cards = 7 }) {
  return (
    <section className="row row-skeleton" aria-hidden="true">
      <div className="row-head">
        <span className="sk sk-title" />
      </div>
      <div className="row-track">
        {Array.from({ length: cards }, (_, i) => (
          <span key={i} className="sk sk-card" />
        ))}
      </div>
    </section>
  );
}

function Row({ title, items, onOpen, onPlay, onToggleList, hasInList, showProgress = false }) {
  const trackRef = useRef(null);
  const [ref, shown] = useReveal();
  const [edges, setEdges] = useState({ start: false, end: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft > 8,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, items]);

  const nudge = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.82), behavior: 'smooth' });
  };

  if (!items?.length) return null;

  return (
    <section
      ref={ref}
      className={`row ${shown ? 'is-in' : ''} ${edges.start ? 'fade-start' : ''} ${
        edges.end ? 'fade-end' : ''
      }`}
      aria-labelledby={`row-${title.replace(/\W+/g, '-').toLowerCase()}`}
    >
      <div className="row-head">
        <h2 className="row-title" id={`row-${title.replace(/\W+/g, '-').toLowerCase()}`}>
          {title}
        </h2>
        <span className="row-rule" aria-hidden="true" />
        <span className="row-count">{items.length}</span>
      </div>

      <div className="row-viewport">
        <button
          type="button"
          className="row-arrow row-arrow-left"
          onClick={() => nudge(-1)}
          disabled={!edges.start}
          aria-label={`Scroll ${title} backwards`}
        >
          <IconChevron dir="left" />
        </button>

        <ul className="row-track" ref={trackRef}>
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className="row-item">
              <MovieCard
                item={item}
                index={i}
                onOpen={onOpen}
                onPlay={onPlay}
                onToggleList={onToggleList}
                inList={hasInList(item.id)}
                progress={showProgress ? item.progress : undefined}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="row-arrow row-arrow-right"
          onClick={() => nudge(1)}
          disabled={!edges.end}
          aria-label={`Scroll ${title} forwards`}
        >
          <IconChevron />
        </button>
      </div>
    </section>
  );
}

export default memo(Row);
