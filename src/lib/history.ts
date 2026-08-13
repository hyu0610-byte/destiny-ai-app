import type { SajuReading } from './types';

const HISTORY_KEY = 'destiny-ai:reading-history';
const MAX_HISTORY = 20;

export function getHistory(): SajuReading[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SajuReading[]) : [];
  } catch {
    return [];
  }
}

export function saveReading(reading: SajuReading): void {
  const history = getHistory();
  const next = [reading, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function getReadingById(id: string): SajuReading | undefined {
  return getHistory().find((r) => r.id === id);
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
