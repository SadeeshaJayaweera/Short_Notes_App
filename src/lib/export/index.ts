import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { marked } from 'marked';

export async function exportNoteToPDF(
  title: string,
  content: string,
  bulletPoints: string[]
): Promise<Blob> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    let yPos = margin;

    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    const titleLines = doc.splitTextToSize(title, maxWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 7 + 5;

    // Add bullet points
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    bulletPoints.forEach((point) => {
      const lines = doc.splitTextToSize(`• ${point}`, maxWidth - 5);
      if (yPos + lines.length * 5 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 2;
    });

    return doc.output('blob');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export note to PDF');
  }
}

export async function exportNoteToWord(
  title: string,
  bulletPoints: string[]
): Promise<Blob> {
  try {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
            }),
            ...bulletPoints.map(
              (point) =>
                new Paragraph({
                  text: point,
                  bullet: {
                    level: 0,
                  },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Failed to export note to Word');
  }
}

export function exportNoteToMarkdown(title: string, bulletPoints: string[]): string {
  try {
    let markdown = `# ${title}\n\n`;

    bulletPoints.forEach((point) => {
      markdown += `- ${point}\n`;
    });

    return markdown;
  } catch (error) {
    console.error('Error exporting to Markdown:', error);
    throw new Error('Failed to export note to Markdown');
  }
}

export async function exportNoteToHTML(title: string, bulletPoints: string[]): Promise<string> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    ul { line-height: 1.8; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <ul>
    ${bulletPoints.map((point) => `<li>${point}</li>`).join('')}
  </ul>
</body>
</html>`;

    return html;
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    throw new Error('Failed to export note to HTML');
  }
}
