import {
  Button,
  createListCollection,
  DownloadTrigger,
  HStack,
  Portal,
  Select,
  Spacer,
} from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PiDownload } from 'react-icons/pi';
import { useParams } from 'react-router';

import { useUpdateResumeTemplate } from '@/mutations/resume';
import { useRenderTemplatePdf } from '@/mutations/templates';
import { profileQueries } from '@/queries/profile';
import { resumeQueries } from '@/queries/resume';
import { templateQueries } from '@/queries/template';

export function ResumeToolbar() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { data: profile } = useSuspenseQuery(profileQueries.item());
  const { data: template } = useSuspenseQuery(templateQueries.localItem(resume.templateId));
  const { data: templateList } = useSuspenseQuery(templateQueries.list(1, 100));
  const { mutateAsync: renderPdf } = useRenderTemplatePdf();
  const { mutate: updateTemplate } = useUpdateResumeTemplate();

  const templateCollection = useMemo(
    () =>
      createListCollection({
        items: templateList.items.map((t) => ({ label: t.title, value: t.id })),
      }),
    [templateList.items]
  );

  const handleExport = async (): Promise<Blob> => {
    const blob = await renderPdf({
      template,
      sections: resume.sections,
      profile,
    });

    return blob;
  };

  const handleTemplateChange = (templateId: string) => {
    updateTemplate({ resumeId: resumeId!, templateId });
  };

  return (
    <HStack p="1.5" borderBottom="1px solid" borderColor="border">
      <Select.Root
        collection={templateCollection}
        value={[resume.templateId]}
        onValueChange={({ value }) => handleTemplateChange(value[0])}
        w="48"
        size="sm"
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select template" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {templateCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
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
