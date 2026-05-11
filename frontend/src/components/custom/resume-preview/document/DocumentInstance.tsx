import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Document as ReactPDFDocument, Page, pdfjs } from 'react-pdf';

import type { TemplateRenderGeometry, TemplateRenderRect } from '@/types/template.types';

import type { ResumeHighlight } from '../ResumePreview';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function DocumentInstance({
  url,
  geometry,
  highlights,
  scale,
  pageWidth,
  limitPages,
  interactable,
  onReady,
}: {
  url: string;
  geometry: TemplateRenderGeometry;
  highlights: ResumeHighlight[];
  scale: number;
  pageWidth: number;
  limitPages: number;
  interactable: boolean;
  onReady: () => void;
}) {
  const [pages, setPages] = useState(0);
  const renderedPages = useRef(0);

  const expectedPages = limitPages === Infinity ? pages : Math.min(pages, limitPages);
  const highlightedRectsByPage = groupRectsByPage(geometry, highlights);

  return (
    <VStack asChild>
      <ReactPDFDocument
        file={url}
        onLoadSuccess={({ numPages }) => {
          setPages(numPages);
          renderedPages.current = 0;
        }}
        loading={null}
      >
        {Array.from(new Array(expectedPages), (_, index) => (
          <Box key={index} position="relative">
            <Page
              pageIndex={index}
              renderAnnotationLayer={interactable}
              renderTextLayer={interactable}
              scale={scale}
              width={pageWidth}
              onRenderSuccess={() => {
                renderedPages.current += 1;
                if (renderedPages.current >= expectedPages) {
                  onReady();
                }
              }}
            />
            <Box position="absolute" inset="0" pointerEvents="none" zIndex="1">
              {(highlightedRectsByPage.get(index) ?? []).map((rect, rectIndex) => (
                <Box
                  key={`${index}-${rectIndex}`}
                  position="absolute"
                  left={`${rect.x * 100}%`}
                  top={`${rect.y * 100}%`}
                  width={`${rect.width * 100}%`}
                  height={`${rect.height * 100}%`}
                  bg={rect.color}
                  border={`1px solid ${rect.color}`}
                  opacity={0.4}
                />
              ))}
            </Box>
          </Box>
        ))}
      </ReactPDFDocument>
    </VStack>
  );
}

function groupRectsByPage(
  geometry: TemplateRenderGeometry,
  highlights: ResumeHighlight[]
): Map<number, Array<TemplateRenderRect & { color: ResumeHighlight['color'] }>> {
  const rectsByPage = new Map<
    number,
    Array<TemplateRenderRect & { color: ResumeHighlight['color'] }>
  >();

  for (const highlight of highlights) {
    const rects = geometry[highlight.unitId] ?? [];
    for (const rect of rects) {
      const pageRects = rectsByPage.get(rect.pageIndex) ?? [];
      pageRects.push({ ...rect, color: highlight.color });
      rectsByPage.set(rect.pageIndex, pageRects);
    }
  }

  return rectsByPage;
}
