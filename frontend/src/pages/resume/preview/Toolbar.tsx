import { Button, DownloadTrigger, HStack, Spacer } from '@chakra-ui/react';
import { useMemo } from 'react';
import { PiDownload, PiLayout } from 'react-icons/pi';
import { useNavigate, useParams } from 'react-router';

import { useRenderTemplate } from '@/mutations/template.mutations';
import type { Profile } from '@/types/profile.types';
import type { Resume } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

export function Toolbar({
  resume,
  template,
  profile,
}: {
  resume: Resume;
  template: Template;
  profile: Profile;
}) {
  const navigate = useNavigate();
  const params = useParams();
  const { mutateAsync: render } = useRenderTemplate();

  const templatesPath = useMemo(() => {
    const { listingId, applicationId, resumeId } = params;
    if (listingId && applicationId && resumeId) {
      return `/listings/${listingId}/applications/${applicationId}/resumes/${resumeId}/templates`;
    }
    return `/resumes/${params.resumeId}/templates`;
  }, [params]);

  async function handleExport(): Promise<Blob> {
    return render({
      template,
      sections: resume.sections,
      profile,
    });
  }

  return (
    <HStack h="10" borderBottom="1px solid" borderColor="border" w="full" p="1">
      <Button variant="subtle" size="xs" onClick={() => navigate(templatesPath)}>
        <PiLayout />
        Choose another template (Current: {template.title})
      </Button>
      <Spacer />
      <DownloadTrigger
        data={handleExport}
        fileName={`resume_${resume.id}.pdf`}
        mimeType="application/pdf"
        asChild
      >
        <Button variant="subtle" size="xs">
          <PiDownload />
          Export
        </Button>
      </DownloadTrigger>
    </HStack>
  );
}
