import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Document as ReactPDFDocument, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function DocumentInstance({
  blob,
  scale,
  pageWidth,
  limitPages,
  interactable,
  onReady,
}: {
  blob: Blob;
  scale: number;
  pageWidth: number;
  limitPages: number;
  interactable: boolean;
  onReady: () => void;
}) {
  const [pages, setPages] = useState(0);
  const renderedPages = useRef(0);

  const expectedPages = limitPages === Infinity ? pages : Math.min(pages, limitPages);

  return (
    <VStack asChild>
      <ReactPDFDocument
        file={blob}
        onLoadSuccess={({ numPages }) => {
          setPages(numPages);
          renderedPages.current = 0;
        }}
        loading={null}
      >
        {Array.from(new Array(expectedPages), (_, index) => (
          <Page
            key={index}
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
        ))}
      </ReactPDFDocument>
    </VStack>
  );
}
