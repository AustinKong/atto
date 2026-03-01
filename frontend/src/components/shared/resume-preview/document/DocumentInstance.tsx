import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
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
  const blobUrlRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const expectedPages = limitPages === Infinity ? pages : Math.min(pages, limitPages);

  // Create a blob URL to avoid ArrayBuffer transfer issues between shared blob instances.
  // This is to fix a bug where sharing a blob between the two instances causes the ArrayBuffer to be transferred and detached, making it unusable by the other instance.
  useEffect(() => {
    blobUrlRef.current = URL.createObjectURL(blob);
    setIsReady(true);

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [blob]);

  return (
    <VStack asChild>
      <ReactPDFDocument
        file={isReady && blobUrlRef.current ? blobUrlRef.current : undefined}
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
