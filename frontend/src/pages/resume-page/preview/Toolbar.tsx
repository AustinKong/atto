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

import { useUpdateResumeTemplate } from '@/mutations/resume';
import { useRenderTemplatePdf } from '@/mutations/templates';
import { templateQueries } from '@/queries/template';
import type { Resume } from '@/types/resume';
import type { Template } from '@/types/template';

export function Toolbar({ resume, template }: { resume: Resume; template: Template }) {
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
      profile: resume.profile,
    });

    return blob;
  };

  const handleTemplateChange = (templateId: string) => {
    updateTemplate({ resumeId: resume.id!, templateId });
  };

  return (
    <HStack h="10" borderBottom="1px solid" borderColor="border" w="full" p="1">
      <Select.Root
        collection={templateCollection}
        value={[resume.templateId]}
        onValueChange={({ value }) => handleTemplateChange(value[0])}
        w="48"
        size="xs"
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
