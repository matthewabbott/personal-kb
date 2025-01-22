// src/config/api.ts
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/personal-kb/api';

export async function fetchJSON<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`API error: ${error}`);
  }
  return response.json();
}

export async function fetchText(endpoint: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`API error: ${error}`);
  }
  return response.text();
}