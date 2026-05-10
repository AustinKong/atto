import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Document as ReactPDFDocument, Page, pdfjs } from 'react-pdf';

import type { TemplateRenderGeometry, TemplateRenderRect } from '@/types/template.types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function DocumentInstance({
  url,
  geometry,
  highlightedUnitIds,
  scale,
  pageWidth,
  limitPages,
  interactable,
  onReady,
}: {
  url: string;
  geometry: TemplateRenderGeometry;
  highlightedUnitIds: string[];
  scale: number;
  pageWidth: number;
  limitPages: number;
  interactable: boolean;
  onReady: () => void;
}) {
  const [pages, setPages] = useState(0);
  const renderedPages = useRef(0);

  const expectedPages = limitPages === Infinity ? pages : Math.min(pages, limitPages);
  const highlightedRectsByPage = groupRectsByPage(geometry, highlightedUnitIds);

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
                  // TODO: Define theme tokens for this
                  bg="rgba(255, 200, 0, 0.24)"
                  outline="1px solid rgba(255, 200, 0, 0.35)"
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
  highlightedUnitIds: string[]
): Map<number, TemplateRenderRect[]> {
  const rectsByPage = new Map<number, TemplateRenderRect[]>();

  for (const unitId of highlightedUnitIds) {
    const rects = geometry[unitId] ?? [];
    for (const rect of rects) {
      const pageRects = rectsByPage.get(rect.pageIndex) ?? [];
      pageRects.push(rect);
      rectsByPage.set(rect.pageIndex, pageRects);
    }
  }

  return rectsByPage;
}
