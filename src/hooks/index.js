import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

const LIST_KEY = 'cinefind:mylist';

/** My List, persisted to localStorage. Storage can fail — never let it crash the UI. */
export function useMyList() {
  // Lazy state init: read storage once, not on every render (react-performance.csv).
  const [list, setList] = useState(() => {
    try {
      const raw = localStorage.getItem(LIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable (private mode, quota) — list still works in memory */
    }
  }, [list]);

  const has = useCallback((id) => list.some((m) => m.id === id), [list]);

  const toggle = useCallback((item) => {
    let added = false;
    setList((prev) => {
      const exists = prev.some((m) => m.id === item.id);
      added = !exists;
      return exists ? prev.filter((m) => m.id !== item.id) : [item, ...prev];
    });
    return added;
  }, []);

  return { list, has, toggle };
}

/** Debounce any fast-changing value (search input). */
export function useDebounced(value, delay = 320) {
  const [out, setOut] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setOut(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return out;
}

/** Reveal-on-scroll. Adds `is-in` once the element enters the viewport. */
export function useReveal(options) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08, ...options },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, options]);

  return [ref, shown];
}

/** Lock body scroll while an overlay is open, without shifting layout. */
export function useBodyLock(active) {
  useLayoutEffect(() => {
    if (!active) return;
    const sb = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.paddingRight;
    document.body.classList.add('is-locked');
    if (sb > 0) document.body.style.paddingRight = `${sb}px`;
    return () => {
      document.body.classList.remove('is-locked');
      document.body.style.paddingRight = prev;
    };
  }, [active]);
}


/** Trap Tab focus inside an overlay and restore it on close (a11y). */
export function useFocusTrap(active, containerRef, onClose) {
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    const returnTo = document.activeElement;
    const sel =
      'a[href],button:not([disabled]),input,select,textarea,iframe,[tabindex]:not([tabindex="-1"])';

    const focusables = () => Array.from(node?.querySelectorAll(sel) || []);
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (returnTo && returnTo.focus) returnTo.focus();
    };
  }, [active, containerRef, onClose]);
}

/** Tiny toast queue for "Added to My List" style feedback. */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return { toasts, push };
}



export function useScrollGlow(timeout = 650) {
  useEffect(() => {
    const root = document.documentElement;
    let t;
    const onScroll = () => {
      root.classList.add('is-scrolling');
      clearTimeout(t);
      t = setTimeout(() => root.classList.remove('is-scrolling'), timeout);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(t);
      root.classList.remove('is-scrolling');
    };
  }, [timeout]);
}


export function useNavScroll() {
  const [state, setState] = useState({ atTop: true, direction: 'up', progress: 0 });

  useEffect(() => {
    let lastY = window.scrollY;
    let dir = 'up';
    let acc = 0;
    let frame = 0;

    const update = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const delta = y - lastY;

      // Accumulate movement instead of trusting a single frame's delta —
      // trackpad/mouse momentum is noisy frame-to-frame, so only flip
      // direction once the user has clearly committed to it.
      acc += delta;
      if (acc > 24) {
        dir = 'down';
        acc = 0;
      } else if (acc < -24) {
        dir = 'up';
        acc = 0;
      }

      setState((prev) => {
        const next = {
          atTop: y < 8,
          direction: dir,
          progress: max > 0 ? Math.min(1, Math.max(0, y / max)) : 0,
        };
        // Bail out if nothing actually changed — avoids a re-render
        // (and therefore a class toggle / restarted transition) on
        // every single scroll frame.
        if (
          prev.atTop === next.atTop &&
          prev.direction === next.direction &&
          prev.progress === next.progress
        ) {
          return prev;
        }
        return next;
      });

      lastY = y;
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}