import { memo } from 'react';
import Poster from './Poster.jsx';
import { IconPlay, IconPlus, IconCheck, IconChevron, IconThumb } from './Icons.jsx';

/**
 * A single title.
 * The whole card is one button: tap/click/Enter opens details on every device.
 * Hover only *adds* the expanded panel — it never gates an action
 * (ux-guidelines: Hover vs Tap).
 */
function MovieCard({ item, index = 0, onOpen, onPlay, onToggleList, inList, progress }) {
  return (
    <div className="card-slot" style={{ '--i': index }}>
      <button
        type="button"
        className="card"
        onClick={() => onOpen(item)}
        aria-label={`${item.title}, ${item.year || ''} ${item.genre}. Open details`}
      >
        <Poster item={item} ratio="2 / 3" layoutId={`poster-${item.id}`} />

        {typeof progress === 'number' && (
          <div className="card-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        )}

        <div className="card-gloss" aria-hidden="true" />

        <div className="card-panel" aria-hidden="true">
          <div className="card-panel-actions">
            <span className="mini mini-play">
              <IconPlay size={14} />
            </span>
            <span
              className={`mini ${inList ? 'is-on' : ''}`}
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onToggleList(item);
              }}
            >
              {inList ? <IconCheck size={14} /> : <IconPlus size={14} />}
            </span>
            <span className="mini">
              <IconThumb size={14} />
            </span>
            <span className="mini mini-end">
              <IconChevron size={14} />
            </span>
          </div>
          <p className="card-panel-title">{item.title}</p>
          <p className="card-panel-meta">
            <span className="match">{item.match}% match</span>
            <span className="badge-cert">{item.cert}</span>
            <span>{item.year}</span>
          </p>
          <p className="card-panel-genres">{item.genres.join(' · ')}</p>
        </div>
      </button>

      {/* Real, focusable quick actions for keyboard + touch users */}
      <div className="card-quick">
        <button
          type="button"
          className="icon-btn icon-btn-sm"
          onClick={() => onPlay(item)}
          aria-label={`Play trailer for ${item.title}`}
        >
          <IconPlay size={14} />
        </button>
        <button
          type="button"
          className={`icon-btn icon-btn-sm ${inList ? 'is-on' : ''}`}
          onClick={() => onToggleList(item)}
          aria-pressed={inList}
          aria-label={inList ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
        >
          {inList ? <IconCheck size={14} /> : <IconPlus size={14} />}
        </button>
      </div>
    </div>
  );
}

export default memo(MovieCard);
