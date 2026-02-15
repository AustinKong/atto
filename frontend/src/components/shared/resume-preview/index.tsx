import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Center, Spinner, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { templateQueries } from '@/queries/template';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PAPER_WIDTH = 816;

export function ResumePreview({
  template,
  sections,
  profile,
}: {
  template: string;
  sections: Section[];
  profile: Profile;
}) {
  const { data: pdfBlob, isLoading } = useQuery(
    templateQueries.renderPdf(template, sections, profile)
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = () => {
      const styles = window.getComputedStyle(preview);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const totalPadding = paddingLeft + paddingRight;

      const availableWidth = preview.clientWidth - totalPadding;
      setScale(Math.min(availableWidth / PAPER_WIDTH, 1));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(preview);

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <Center h="full" bg="gray.100" _dark={{ bg: 'gray.800' }}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!pdfBlob) {
    return (
      <Center h="full" bg="gray.100" _dark={{ bg: 'gray.800' }} color="gray.500">
        No preview available
      </Center>
    );
  }

  return (
    <VStack
      w="full"
      h="full"
      ref={previewRef}
      bg="gray.100"
      _dark={{ bg: 'gray.800' }}
      overflowY="auto"
      overflowX="hidden"
      p={8}
      align="center"
      justify="flex-start"
      gap={6}
      position="relative"
      asChild
    >
      <Document
        file={pdfBlob}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Spinner size="xl" />}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            pageNumber={index + 1}
            scale={scale}
            renderAnnotationLayer={false}
            renderTextLayer={true}
          />
        ))}
      </Document>
    </VStack>
  );
}
