import { ParsedDocument } from '@/types';

export function parseText(text: string, fileName: string = 'text-input'): ParsedDocument {
  if (!text.trim()) {
    throw new Error('Text appears to be empty');
  }

  return {
    text: text.trim(),
    fileName: fileName,
    sourceType: 'text',
  };
}
