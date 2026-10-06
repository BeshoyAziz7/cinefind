"use client"

import * as React from "react"
import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-carousel"
import { IconPlay, IconInfo, IconPlus, IconCheck } from "./Icons.jsx"

export interface MovieLike {
  id: number | string
  title: string
  year?: number
  rating?: number
  cert?: string
  runtime?: number | null
  genres?: string[]
  overview?: string
  backdropUrl?: string | null
  posterUrl?: string | null
  gradient?: [string, string]
}

interface MovieSlide extends HeroCarouselItem {
  raw: MovieLike
}

export interface HeroCarouselSectionProps {
  items: MovieLike[]
  loading?: boolean
  onPlay: (item: MovieLike) => void
  onOpen: (item: MovieLike) => void
  onToggleList: (item: MovieLike) => void
  hasInList: (id: MovieLike["id"]) => boolean
}

/**
 * When there's no real backdrop/poster (offline demo catalogue), generate a
 * gradient "photo" on the fly instead of dropping the slide. Mirrors the
 * gradient-plate look Poster.jsx already uses for the same situation.
 */
function placeholderImage(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${from}" />
        <stop offset="100%" stop-color="${to}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function toSlide(item: MovieLike): MovieSlide {
  const [from, to] = item.gradient ?? ["#1c1917", "#44403c"]
  const meta: string[] = []
  if (item.year) meta.push(String(item.year))
  if (item.cert) meta.push(item.cert)
  if (item.runtime) {
    meta.push(`${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`)
  }

  return {
    id: item.id,
    title: item.title,
    image: item.backdropUrl || item.posterUrl || placeholderImage(from, to),
    credit: item.genres?.length ? item.genres.join(" · ") : undefined,
    meta: meta.length ? meta : undefined,
    accent: to,
    raw: item,
  }
}

export default function HeroCarouselSection({
  items,
  loading,
  onPlay,
  onOpen,
  onToggleList,
  hasInList,
}: HeroCarouselSectionProps) {
  const slides = React.useMemo(
    () => items.filter(Boolean).map(toSlide),
    [items]
  )

  if (loading || slides.length === 0) {
    return (
      <div
        className="relative flex h-screen w-full items-end bg-black p-8 text-white"
        aria-busy="true"
      >
        <div className="h-16 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    )
  }

  return (
    <HeroCarousel<MovieSlide>
      items={slides}
      defaultIndex={0}
      brand="CINEFIND"
      className="h-screen"
      renderActions={(slide) => {
        const inList = hasInList(slide.raw.id)
        return (
          <>
            <button
              type="button"
              onClick={() => onPlay(slide.raw)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-black transition hover:bg-white/90"
            >
              <IconPlay size={18} /> Play trailer
            </button>
            <button
              type="button"
              onClick={() => onOpen(slide.raw)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-white/20 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/30"
            >
              <IconInfo size={18} /> More info
            </button>
            <button
              type="button"
              onClick={() => onToggleList(slide.raw)}
              aria-pressed={inList}
              aria-label={inList ? "Remove from My List" : "Add to My List"}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                inList
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-hover)]"
                  : "border-white/40 bg-black/40 text-white hover:border-white"
              }`}
            >
              {inList ? <IconCheck size={18} /> : <IconPlus size={18} />}
            </button>
          </>
        )
      }}
    />
  )
}
