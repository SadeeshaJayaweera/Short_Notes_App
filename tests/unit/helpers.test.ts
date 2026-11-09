import { describe, it, expect } from 'vitest';
import {
  generateShareToken,
  formatDate,
  truncateText,
  sanitizeFileName,
  renderMarkdown,
} from '@/lib/helpers';

describe('Helpers Utility Functions', () => {
  it('generateShareToken generates a 64-character hexadecimal string', () => {
    const token = generateShareToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('formatDate formats valid Date or ISO string accurately', () => {
    const testDate = new Date('2026-11-09T10:30:00Z');
    const formatted = formatDate(testDate);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Nov');
  });

  it('truncateText trims text longer than limit with ellipsis', () => {
    const text = 'This is a long sentence that should definitely be truncated properly.';
    const result = truncateText(text, 20);
    expect(result).toBe('This is a long sente...');
    expect(result.length).toBe(23);
  });

  it('truncateText leaves short text unaltered', () => {
    const text = 'Short';
    expect(truncateText(text, 20)).toBe('Short');
  });

  it('sanitizeFileName replaces special characters with underscores', () => {
    const fileName = 'My Research Paper (Final Draft) #1.pdf';
    const sanitized = sanitizeFileName(fileName);
    expect(sanitized).toBe('My_Research_Paper__Final_Draft___1.pdf');
  });

  it('renderMarkdown converts markdown string to HTML synchronously', () => {
    const md = '# Header\n\n- Point 1\n- Point 2';
    const html = renderMarkdown(md);
    expect(html).toContain('<h1>Header</h1>');
    expect(html).toContain('<li>Point 1</li>');
  });

  it('renderMarkdown returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });
});

