import type { SajuReading } from './types';
import { apiRequest } from './apiClient';

export async function getHistory(): Promise<SajuReading[]> {
  const data = await apiRequest<{ readings: SajuReading[] }>('/api/readings', { auth: true });
  return data.readings;
}

export async function saveReading(reading: SajuReading): Promise<SajuReading> {
  const data = await apiRequest<{ reading: SajuReading }>('/api/readings', {
    method: 'POST',
    auth: true,
    body: reading,
  });
  return data.reading;
}

export async function deleteReading(id: string): Promise<void> {
  await apiRequest<void>(`/api/readings/${id}`, { method: 'DELETE', auth: true });
}

export async function clearHistory(): Promise<void> {
  await apiRequest<void>('/api/readings', { method: 'DELETE', auth: true });
}
