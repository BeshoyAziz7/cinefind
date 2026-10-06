import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Poster from './Poster.jsx';
import { IconPlay, IconPlus, IconCheck, IconClose, IconThumb, IconShare } from './Icons.jsx';
import { fetchDetails } from '../lib/tmdb.js';
import { useBodyLock, useFocusTrap } from '../hooks/index.js';
import './Modal.css';
import './DetailModal.css';

const EASE = [0.22, 1, 0.36, 1];
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Cast & Details' },
  { id: 'similar', label: 'More Like This' },
];
const AVATAR_HUES = ['#e11d48', '#4338ca', '#059669', '#f59e0b', '#0891b2', '#a855f7'];

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function RatingRing({ value = 0, size = 44 }) {
  const pct = Math.max(0, Math.min(10, value || 0)) / 10;
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color = pct >= 0.7 ? 'var(--success)' : pct >= 0.4 ? 'var(--warning)' : 'var(--destructive)';
  return (
    <span className="dm-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="dm-ring-value">{typeof value === 'number' ? value.toFixed(1) : value}</span>
    </span>
  );
}

/** Faux player used when no TMDB trailer key is available (offline demo). */
function DemoPlayer({ title }) {
  return (
    <div className="demo-player" role="img" aria-label={`Trailer placeholder for ${title}`}>
      <div className="demo-bars" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
      <p className="demo-player-label">
        Trailer playback is wired to the TMDB video endpoint.
        <br />
        <span>Add a VITE_TMDB_API_KEY to stream the real YouTube trailer here.</span>
      </p>
    </div>
  );
}

export default function DetailModal({ item, startPlaying, onClose, onOpen, onToggleList, hasInList }) {
  const [data, setData] = useState(item);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(Boolean(startPlaying));
  const [tab, setTab] = useState('overview');
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useBodyLock(true);
  useFocusTrap(true, panelRef, onClose);

  useEffect(() => {
    let alive = true;
    setData(item);
    setLoading(true);
    setPlaying(Boolean(startPlaying));
    setTab('overview');
    setScrolled(false);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    fetchDetails(item).then((full) => {
      if (!alive) return;
      setData(full);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [item, startPlaying]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 220);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [data]);

  const inList = hasInList(item.id);
  const [from, to] = data.gradient || ['#1c1917', '#44403c'];
  const titleWords = (data.title || '').split(' ');
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 };

  return (
    <div className="modal-root" role="presentation">
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="dm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        ref={panelRef}
        style={{ '--from': from, '--to': to }}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.2, ease: EASE } }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 28 }}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close details">
          <IconClose />
        </button>

        <AnimatePresence>
          {scrolled && (
            <motion.div
              className="dm-miniheader"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              <span className="dm-mini-title">{data.title}</span>
              <button type="button" className="dm-mini-play" onClick={() => setPlaying(true)}>
                <IconPlay size={13} /> Play
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="dm-body" ref={bodyRef}>
          <div className="dm-stage">
            {playing ? (
              data.trailerKey ? (
                <iframe
                  className="modal-video"
                  src={`https://www.youtube-nocookie.com/embed/${data.trailerKey}?autoplay=1&rel=0`}
                  title={`${data.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <DemoPlayer title={data.title} />
              )
            ) : (
              <>
                <div className="dm-stage-img-wrap">
                  <Poster
                  item={data}
                  ratio="16 / 9"
                  sizes="100vw"
                  priority
                  className="modal-art"
                  layoutId={`poster-${data.id}`}
                />
                </div>
                <div className="dm-stage-scrim" aria-hidden="true" />
                <div className="dm-stage-vignette" aria-hidden="true" />

                <div className="dm-stage-content" key={data.id}>
                  <motion.p
                    className="dm-eyebrow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    {(data.genres && data.genres[0]) || data.genre || 'Featured'}
                    {data.year ? ` · ${data.year}` : ''}
                  </motion.p>

                  <h2 className="dm-title" id="detail-title">
                    {titleWords.map((w, i) => (
                      <span className="dm-title-word-mask" key={i}>
                        <motion.span
                          className="dm-title-word"
                          initial={{ y: '110%' }}
                          animate={{ y: 0 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.6,
                            delay: reduceMotion ? 0 : 0.08 + i * 0.06,
                            ease: EASE,
                          }}
                        >
                          {w}&nbsp;
                        </motion.span>
                      </span>
                    ))}
                  </h2>

                  <motion.div
                    className="dm-meta-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
                  >
                    <RatingRing value={data.rating} />
                    {typeof data.match === 'number' && <span className="dm-match">{data.match}% Match</span>}
                    {data.cert && <span className="badge-cert">{data.cert}</span>}
                    {data.runtime && (
                      <span>
                        {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                      </span>
                    )}
                  </motion.div>

                  <motion.div
                    className="dm-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
                  >
                    <button type="button" className="dm-play-btn" onClick={() => setPlaying(true)}>
                      <IconPlay size={18} /> Play Trailer
                    </button>
                    <button
                      type="button"
                      className={`icon-btn ${inList ? 'is-on' : ''}`}
                      onClick={() => onToggleList(data)}
                      aria-pressed={inList}
                      aria-label={inList ? 'Remove from My List' : 'Add to My List'}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {inList ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={spring}
                            style={{ display: 'grid', placeItems: 'center' }}
                          >
                            <IconCheck />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="plus"
                            initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={spring}
                            style={{ display: 'grid', placeItems: 'center' }}
                          >
                            <IconPlus />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                    <button type="button" className="icon-btn" aria-label="Rate this title">
                      <IconThumb />
                    </button>
                    <button type="button" className="icon-btn" aria-label="Share this title">
                      <IconShare />
                    </button>
                  </motion.div>
                </div>
              </>
            )}
          </div>

          <div className="dm-content">
            <div className="dm-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`dm-tab ${tab === t.id ? 'is-active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  {tab === t.id && (
                    <motion.span className="dm-tab-underline" layoutId="dm-tab-underline" transition={spring} />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'overview' && (
                <motion.div
                  key="overview"
                  className="dm-tab-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <p className="dm-overview">{data.overview}</p>
                  {data.genres?.length > 0 && (
                    <div className="dm-genre-pills">
                      {data.genres.map((g) => (
                        <span className="dm-pill" key={g}>
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'details' && (
                <motion.div
                  key="details"
                  className="dm-tab-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <div className="dm-cast-grid">
                    {loading
                      ? Array.from({ length: 5 }, (_, i) => (
                          <div className="dm-cast-card" key={i} style={{ '--i': i }}>
                            <span className="sk" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                            <span className="sk sk-line" style={{ width: 70, height: 10 }} />
                          </div>
                        ))
                      : (data.cast || []).map((name, i) => (
                          <div className="dm-cast-card" key={name} style={{ '--i': i }}>
                            <span className="dm-avatar" style={{ background: AVATAR_HUES[i % AVATAR_HUES.length] }}>
                              {initials(name)}
                            </span>
                            <span className="dm-cast-name">{name}</span>
                          </div>
                        ))}
                    {!loading && !(data.cast || []).length && (
                      <p className="dm-overview">Cast information isn&rsquo;t available for this title.</p>
                    )}
                  </div>

                  <dl className="dm-facts">
                    <dt>Genres</dt>
                    <dd>{data.genres?.join(', ') || '—'}</dd>
                    <dt>Audio</dt>
                    <dd>English · 5.1</dd>
                    <dt>Rating</dt>
                    <dd>{data.cert || '—'}</dd>
                  </dl>
                </motion.div>
              )}

              {tab === 'similar' && (
                <motion.div
                  key="similar"
                  className="dm-tab-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <div className="dm-similar-grid">
                    {loading
                      ? Array.from({ length: 6 }, (_, i) => (
                          <span key={i} className="sk" style={{ aspectRatio: '2 / 3' }} />
                        ))
                      : (data.similar || []).map((s, i) => (
                          <button
                            key={s.id}
                            type="button"
                            className="dm-similar-card"
                            style={{ '--i': i }}
                            onClick={() => onOpen(s)}
                            aria-label={`Open details for ${s.title}`}
                          >
                            <Poster item={s} ratio="2 / 3" sizes="180px" />
                            <span className="dm-similar-title">{s.title}</span>
                          </button>
                        ))}
                    {!loading && !(data.similar || []).length && (
                      <p className="dm-overview">No similar titles found.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}