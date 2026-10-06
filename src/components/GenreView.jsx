import GenreHero from './GenreHero.jsx';
import GridCard from './GridCard.jsx';
import { IconSearch } from './Icons.jsx';
import './Genre.css';

export default function GenreView({
  genre,
  items,
  loading,
  sort,
  onSortChange,
  onOpen,
  onPlay,
  onToggleList,
  hasInList,
  onClear,
}) {
  return (
    <section className="genre-view">
      {!loading && items.length > 0 && (
        <GenreHero genre={genre} items={items} sort={sort} onSortChange={onSortChange} onBack={onClear} />
      )}

      <div className="genre-grid-wrap">
        {loading ? (
          <div className="genre-grid">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="sk" style={{ aspectRatio: '2 / 3' }} />
            ))}
          </div>
        ) : items.length ? (
          <div className="genre-grid">
            {items.map((item, i) => (
              <GridCard
                key={item.id}
                item={item}
                index={i}
                onOpen={onOpen}
                onPlay={onPlay}
                onToggleList={onToggleList}
                inList={hasInList(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <IconSearch size={34} />
            <p className="empty-title">No titles in {genre} yet</p>
            <p className="empty-sub">Try a different category, or head back to Home.</p>
            <button type="button" className="btn btn-accent" onClick={onClear}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </section>
  );
}