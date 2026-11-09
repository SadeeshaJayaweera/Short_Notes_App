import { describe, it, expect } from 'vitest';
import { parseText } from '@/lib/parsers/text-parser';

describe('Document Parsers', () => {
  it('parseText extracts plain text and preserves file metadata', () => {
    const raw = 'The quick brown fox jumps over the lazy dog.';
    const fileName = 'test.txt';

    const parsed = parseText(raw, fileName);

    expect(parsed.text).toBe(raw);
    expect(parsed.fileName).toBe(fileName);
    expect(parsed.sourceType).toBe('text');
  });

  it('parseText throws error when text is empty or only whitespace', () => {
    expect(() => parseText('   \n\t  ', 'empty.txt')).toThrow(
      'Text appears to be empty'
    );
  });
});
