import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, Center, Spinner, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Document as ReactPDFDocument, Page, pdfjs } from 'react-pdf';

import { templateQueries } from '@/queries/template';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function Document({
  template,
  sections,
  profile,
  interactable = false,
  scale = 0,
  limitPages = Infinity,
  pageWidth = 595,
}: {
  template: string;
  sections: Section[];
  profile: Profile;
  interactable?: boolean;
  scale?: number;
  limitPages?: number;
  pageWidth?: number;
}) {
  const { data: blob, isFetching } = useQuery(
    templateQueries.renderPdf(template, sections, profile)
  );

  const targetVersion = useMemo(() => {
    const profileStr = JSON.stringify(profile);
    const sectionsStr = JSON.stringify(sections);
    return `${template}-${profileStr}-${sectionsStr}-${template}-${scale}`;
  }, [template, sections, profile, scale]);

  useEffect(() => {
    setRenderedPages(0);
  }, [targetVersion]);

  const [pages, setPages] = useState(0);
  const [renderedPages, setRenderedPages] = useState(0);
  const [renderedVersion, setRenderedVersion] = useState('');

  const expectedPages = pages === 0 ? 0 : Math.min(limitPages, pages);

  const isPainting =
    renderedVersion !== targetVersion || renderedPages < expectedPages || pages === 0;

  const isLoading = (!blob && isFetching) || isPainting;

  return (
    <>
      {isLoading && (
        <Center
          h="full"
          position="absolute"
          bgColor="black"
          left="0"
          top="0"
          right="0"
          bottom="0"
          zIndex="10"
        >
          <Spinner />
        </Center>
      )}

      <Box visibility={isLoading ? 'hidden' : 'visible'}>
        <VStack asChild>
          <ReactPDFDocument
            file={blob}
            onLoadSuccess={({ numPages }) => {
              setPages(numPages);
              setRenderedPages(0);
            }}
            loading={null}
          >
            {Array.from(new Array(expectedPages), (_, index) => (
              <Page
                key={`${targetVersion}-${index}`}
                pageIndex={index}
                renderAnnotationLayer={interactable}
                renderTextLayer={interactable}
                scale={scale}
                width={pageWidth}
                onRenderSuccess={() => {
                  setRenderedPages((prev) => {
                    // Ensure we only remove the loading state after all pages have rendered
                    const next = prev + 1;
                    if (next >= expectedPages) {
                      setRenderedVersion(targetVersion);
                    }
                    return next;
                  });
                }}
              />
            ))}
          </ReactPDFDocument>
        </VStack>
      </Box>
    </>
  );
}
