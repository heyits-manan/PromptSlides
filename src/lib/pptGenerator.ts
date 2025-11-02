import PptxGenJS from 'pptxgenjs';
import type { Presentation } from '@/types';

export async function generatePPTX(presentation: Presentation): Promise<Blob> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'AI Presentation Generator';
  pptx.company = 'AI Slides';
  pptx.title = presentation.title;
  pptx.subject = presentation.description || '';

  // Define color scheme
  const colors = {
    primary: '5B21B6', // Purple
    secondary: '2563EB', // Blue
    text: '1F2937', // Dark gray
    lightBg: 'F3F4F6', // Light gray
  };

  // Generate slides
  const stripEmphasis = (text: string) =>
    text.replace(/\*\*(.+?)\*\*/g, '$1');

  presentation.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();

    if (index === 0) {
      // Title slide
      slide.background = { color: 'FFFFFF' };

      // Add gradient shape as background accent
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 1.5,
        fill: { type: 'solid', color: colors.primary },
      });

      // Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: colors.text,
        align: 'center',
        valign: 'middle',
      });

      // Subtitle (if available in content)
      if (slideData.content && slideData.content.length > 0) {
        slide.addText(stripEmphasis(slideData.content[0]), {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.8,
          fontSize: 18,
          color: '6B7280',
          align: 'center',
        });
      }

    } else {
      // Content slides
      slide.background = { color: 'FFFFFF' };

      // Add header bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.8,
        fill: { type: 'solid', color: colors.primary },
      });

      // Slide title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.15,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: 'FFFFFF',
      });

      // Add content bullets
      if (slideData.content && slideData.content.length > 0) {
        const bulletPoints = slideData.content.map((point) => ({
          text: stripEmphasis(point),
          options: {
            bullet: true,
            fontSize: 18,
            color: colors.text,
            paraSpaceAfter: 12,
          },
        }));

        slide.addText(bulletPoints, {
          x: 0.8,
          y: 1.5,
          w: 8.4,
          h: 4.5,
          fontSize: 18,
          color: colors.text,
        });
      }

      // Add slide number
      slide.addText(`${index + 1}`, {
        x: 9.2,
        y: 5.2,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: '9CA3AF',
        align: 'right',
      });
    }
  });

  // Generate the PPTX file
  const blob = await pptx.write({ outputType: 'blob' }) as Blob;
  return blob;
}

export function downloadPPTX(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pptx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
