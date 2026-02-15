import { Button, DownloadTrigger, HStack, Spacer } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PiDownload } from 'react-icons/pi';
import { useParams } from 'react-router';

import { useRenderTemplatePdf } from '@/mutations/templates';
import { profileQueries } from '@/queries/profile';
import { resumeQueries } from '@/queries/resume';
import { templateQueries } from '@/queries/template';

export function ResumeToolbar() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: template } = useSuspenseQuery(templateQueries.item(resume.templateId));
  const { mutateAsync: renderPdf } = useRenderTemplatePdf();

  const handleExport = async (): Promise<Blob> => {
    const blob = await renderPdf({
      template,
      sections: resume.sections,
      profile,
    });

    return blob;
  };

  return (
    <HStack p="1.5" borderBottom="1px solid" borderColor="border">
      <Spacer />
      <DownloadTrigger
        data={handleExport}
        fileName={`resume_${resumeId}.pdf`}
        mimeType="application/pdf"
        asChild
      >
        <Button variant="subtle">
          <PiDownload />
          Export
        </Button>
      </DownloadTrigger>
    </HStack>
  );
}
