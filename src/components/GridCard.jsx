import { memo } from 'react';
import Poster from './Poster.jsx';
import { IconPlay, IconPlus, IconCheck, IconStar } from './Icons.jsx';

function ratingTier(rating = 0) {
  if (rating >= 7) return 'high';
  if (rating >= 5) return 'mid';
  return 'low';
}

function GridCard({ item, index = 0, onOpen, onPlay, onToggleList, inList }) {
  return (
    <div className="gcard" style={{ '--i': index }}>
      <button
        type="button"
        className="gcard-poster-btn"
        onClick={() => onOpen(item)}
        aria-label={`${item.title}, ${item.year || ''}. Open details`}
      >
        <div className="gcard-media">
          <Poster item={item} ratio="2 / 3" sizes="210px" layoutId={`poster-${item.id}`} />

          {typeof item.rating === 'number' && item.rating > 0 && (
            <span className="gcard-rating" data-tier={ratingTier(item.rating)}>
              <IconStar /> {item.rating.toFixed(1)}
            </span>
          )}

          <span className="gcard-gloss" aria-hidden="true" />
          <span className="gcard-scrim" aria-hidden="true" />

          <div className="gcard-overlay" aria-hidden="true">
            <p className="gcard-title">{item.title}</p>
            <p className="gcard-meta">
              {typeof item.match === 'number' && <span className="match">{item.match}% match</span>}
              {item.year && <span>{item.year}</span>}
              {item.cert && <span>{item.cert}</span>}
            </p>
            {item.genres?.length > 0 && <p className="gcard-genres">{item.genres.join(' · ')}</p>}
          </div>
        </div>
      </button>

      <div className="gcard-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onPlay(item)}
          aria-label={`Play trailer for ${item.title}`}
        >
          <IconPlay size={13} />
        </button>
        <button
          type="button"
          className={`icon-btn ${inList ? 'is-on' : ''}`}
          onClick={() => onToggleList(item)}
          aria-pressed={inList}
          aria-label={inList ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
        >
          {inList ? <IconCheck size={13} /> : <IconPlus size={13} />}
        </button>
      </div>
    </div>
  );
}

export default memo(GridCard);