import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export function resolveApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
}
