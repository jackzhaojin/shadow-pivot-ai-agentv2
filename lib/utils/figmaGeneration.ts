export interface FigmaGenState {
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
}

export function createFigmaGenStateArray(count = 3): FigmaGenState[] {
  return Array.from({ length: count }, () => ({ progress: 0, status: 'waiting' as const }));
}

export function updateFigmaGenProgress(
  states: FigmaGenState[],
  index: number,
  progress: number,
  error?: string
): FigmaGenState[] {
  const next = states.slice();
  const state = { ...next[index] };
  if (error) {
    state.status = 'error';
  } else {
    state.progress = Math.min(100, progress);
    state.status = state.progress >= 100 ? 'completed' : 'processing';
  }
  next[index] = state;
  return next;
}
