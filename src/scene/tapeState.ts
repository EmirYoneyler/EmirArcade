/**
 * Per-frame values shared between the tape rack and EMIR-1's deck.
 * Written by <Tapes> in useFrame, read by the deck lid — plain mutable
 * state on purpose, so nothing re-renders 60 times a second.
 */
export const tapeState = {
  /** 0 = deck lid closed, 1 = fully open */
  lid: 0,
  /** reels spin while a tape is playing */
  playing: false,
}
