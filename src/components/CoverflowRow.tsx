"use client";

import * as React from "react";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";
import { useReveal } from "../hooks/index.js";
import "./Row.css";
import { TextReveal } from "@/components/ui/cascade-text";

export interface MovieLike {
  id: number | string;
  title: string;
  year?: number;
  rating?: number;
  cert?: string;
  genre?: string;
  genres?: string[];
  posterUrl?: string | null;
  backdropUrl?: string | null;
  gradient?: [string, string];
  progress?: number;
}

interface MovieSlide extends CoverflowSlide {
  raw: MovieLike;
}

function placeholderImage(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${from}" />
        <stop offset="100%" stop-color="${to}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function toSlide(item: MovieLike): MovieSlide {
  const [from, to] = item.gradient ?? ["#1c1917", "#44403c"];
  return {
    src: item.posterUrl || item.backdropUrl || placeholderImage(from, to),
    alt: item.title,
    raw: item,
  };
}

export interface CoverflowRowProps {
  title: string;
  items: MovieLike[];
  onOpen: (item: MovieLike) => void;
  onPlay?: (item: MovieLike) => void;
  onToggleList?: (item: MovieLike) => void;
  hasInList?: (id: MovieLike["id"]) => boolean;
  showProgress?: boolean;
}

export default function CoverflowRow({
  title,
  items,
  onOpen,
}: CoverflowRowProps) {
  const [ref, shown] = useReveal() as [React.RefObject<HTMLElement>, boolean];

  const slides = React.useMemo(
    () => items.filter(Boolean).map(toSlide),
    [items],
  );

  if (!slides.length) return null;

  const headingId = `row-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <section ref={ref} className={`row ${shown ? "is-in" : ""}`} aria-labelledby={headingId}>
      <div className="row-head">
        <h2 className="row-title" id={headingId}>
  <TextReveal
    as="span"
    text={title}
    fontSize="inherit"
    hoverColor="var(--accent-hover)"
    staggerDelay={18}
    duration={220}
    style={{ padding: 0, lineHeight: "inherit", letterSpacing: "inherit" }}
        />
        </h2>
        <span className="row-rule" aria-hidden="true" />
        <span className="row-count">{slides.length}</span>
      </div>

      <div style={{ paddingInline: "clamp(16px, 4vw, 56px)" }}>
        <CoverflowCarousel
          slides={slides}
          label={title}
          showCaption={false}
          showNavigation
          onSlideSelect={(slide) => onOpen((slide as MovieSlide).raw)}
        />
      </div>
    </section>
  );
}