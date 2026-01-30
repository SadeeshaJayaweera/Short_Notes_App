import crypto from 'crypto';

export function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}

export const COLORS = {
  blue: '#3B82F6',
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#A855F7',
  pink: '#EC4899',
  gray: '#6B7280',
  teal: '#14B8A6',
} as const;

export const COLOR_NAMES = Object.keys(COLORS) as Array<keyof typeof COLORS>;
