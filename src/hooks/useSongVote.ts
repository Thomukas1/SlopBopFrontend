import { useCallback, useEffect, useState } from 'react';
import { voteSong, type VoteType, type SongStats } from '../services/slopbop';

const VOTED_KEY = 'slopbop_votes';

function getVotedSongs(): Record<string, VoteType> {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markVoted(songId: string, type: VoteType) {
  const voted = getVotedSongs();
  voted[songId] = type;
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
}

/**
 * Local-first song voting, shared by the mini and full players. One vote per
 * song, remembered in localStorage so the choice sticks across both surfaces
 * (they read the same key) and survives reloads. `stats` seeds from the track
 * and updates to the server's fresh count once a vote lands.
 */
export function useSongVote(songId: string | undefined, initialStats?: SongStats | null) {
  const [stats, setStats] = useState<SongStats | null>(initialStats ?? null);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    setStats(initialStats ?? null);
    setUserVote(songId ? getVotedSongs()[songId] ?? null : null);
  }, [songId, initialStats]);

  const vote = useCallback(async (type: VoteType) => {
    if (!songId || userVote || voting) return;
    setVoting(true);
    try {
      const updated = await voteSong(songId, type);
      setStats(updated);
      setUserVote(type);
      markVoted(songId, type);
    } finally {
      setVoting(false);
    }
  }, [songId, userVote, voting]);

  return { stats, userVote, voting, vote };
}
