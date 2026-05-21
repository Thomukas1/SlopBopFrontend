# CollectionPage — Context & Flow

## What it is

A read-only collection view (album/EP/single) for a SlopBop artist. Songs
are published server-side by the simulator; the frontend only displays
them.

## Route

`/collections/:id` — `id` param maps to a collection document in the backend.

## Data Flow

```
useCollection(id)  → collection metadata + songs[]
useArtist(id)      → artist name/profile (derived from collection.artist_id)
useSim()           → current sim_time used as the release cutoff
```

All load in parallel on mount. Page shows a spinner until both
`collectionLoading` and `artistLoading` resolve.

## Release gating

Songs are only shown when `song.release_date <= sim.sim_time`. Both fields
are fixed-width `"YYYY-MM-DDTHH:MM"` strings — lexicographic comparison
matches chronological order, so no `Date` parsing is needed. Songs
without a `release_date` are treated as unreleased (dropped) during the
backfill window.

## Layout (top → bottom)

1. **Cover Art** — full-width square image, falls back to `/Images/default_song_cover.png`
2. **Metadata** — title, collection type, linked artist name, formatted creation date
3. **Tracklist** — numbered song rows inside a card. Each row is a button that calls `play()` from `MusicPlayerContext`, passing the song data (audio URL, lyrics, stats, cover)

## Key Interactions

### Playing a song
User taps a track row → `play()` pushes a `Track` object into `MusicPlayerContext` → global player starts playback.
