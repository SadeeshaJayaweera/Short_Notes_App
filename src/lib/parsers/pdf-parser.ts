import pdfParse from 'pdf-parse';
import { ParsedDocument } from '@/types';

export async function parsePDF(buffer: Buffer, fileName: string): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';

    if (!text.trim()) {
      throw new Error('PDF appears to be empty or unreadable');
    }

    return {
      text: text.trim(),
      fileName: fileName,
      sourceType: 'pdf',
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}
