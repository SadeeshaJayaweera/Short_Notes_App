import { describe, it, expect } from 'vitest';
import { exportNoteToMarkdown, exportNoteToHTML } from '@/lib/export';

describe('Export Service', () => {
  it('exportNoteToMarkdown converts title and bullet points to Markdown format', () => {
    const title = 'Architecture Overview';
    const points = ['Modular services', 'Prisma ORM', 'PostgreSQL database'];

    const md = exportNoteToMarkdown(title, points);

    expect(md).toContain('# Architecture Overview');
    expect(md).toContain('- Modular services');
    expect(md).toContain('- Prisma ORM');
    expect(md).toContain('- PostgreSQL database');
  });

  it('exportNoteToHTML converts title and bullet points to valid HTML document', async () => {
    const title = 'Meeting Summary';
    const points = ['Sprint planning completed', 'Q1 goals set'];

    const html = await exportNoteToHTML(title, points);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1>Meeting Summary</h1>');
    expect(html).toContain('<li>Sprint planning completed</li>');
    expect(html).toContain('<li>Q1 goals set</li>');
  });
});

