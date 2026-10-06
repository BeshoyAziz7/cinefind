import { useState, memo } from 'react';
import { motion } from 'framer-motion';

function Poster({ item, ratio = '2 / 3', sizes = '220px', priority = false, className = '', layoutId, children }) {
  const [loaded, setLoaded] = useState(false);
  const src = ratio === '16 / 9' ? item.backdropUrl || item.posterUrl : item.posterUrl;
  const [from, to] = item.gradient || ['#1c1917', '#44403c'];

  const Wrapper = layoutId ? motion.div : 'div';
  const sharedProps = layoutId
    ? { layoutId, transition: { layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }
    : {};

  return (
    <Wrapper
      className={`poster ${className}`}
      style={{ aspectRatio: ratio, '--from': from, '--to': to }}
      {...sharedProps}
    >
      {src ? (
        <img
          className={`poster-img ${loaded ? 'is-loaded' : ''}`}
          src={src}
          alt=""
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="poster-plate" aria-hidden="true">
          <span className="poster-plate-title">{item.title}</span>
          <span className="poster-plate-meta">
            {item.year} · {item.genre}
          </span>
          <span className="poster-grain" />
        </div>
      )}
      {children}
    </Wrapper>
  );
}

export default memo(Poster);