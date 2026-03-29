import { Badge, Card, Center, HStack, Spinner, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memo } from 'react';

import { ReadonlyResumePreview } from '@/components/custom/resume-preview';
import { toaster } from '@/components/ui/Toaster';
import { DEFAULT_TEMPLATE_PROFILE, DEFAULT_TEMPLATE_SECTIONS } from '@/constants/template.constants';
import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';
import { updateResume } from '@/services/resume.service';
import { downloadRemoteTemplate } from '@/services/template.service';
import type { Template, TemplateSummary } from '@/types/template.types';

export const TemplateCard = memo(function TemplateCard({
  template,
  resumeId,
  isSelected,
}: {
  template: TemplateSummary;
  resumeId?: string;
  isSelected?: boolean;
}) {
  const queryClient = useQueryClient();

  const { data: templateContent, isLoading } = useQuery(templateQueries.item(template.id));

  const downloadMutation = useMutation({
    mutationFn: () => downloadRemoteTemplate(template.id),
    onSuccess: () => {
      toaster.success({
        title: 'Template downloaded',
        description: `${template.title || template.id} has been downloaded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: Error) => {
      toaster.error({
        title: 'Failed to download template',
        description: error.message,
      });
    },
  });

  const selectMutation = useMutation({
    mutationFn: async () => {
      const resume = await queryClient.ensureQueryData(resumeQueries.item(resumeId!));
      return updateResume({ ...resume, templateId: template.id });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(resumeQueries.item(resumeId!).queryKey, data);
    },
    onError: (error: Error) => {
      toaster.error({
        title: 'Failed to select template',
        description: error.message,
      });
    },
  });

  const isRemoteOnly = template.source === 'remote';
  const isActionable = isRemoteOnly || (!!resumeId && !isSelected);

  function handleClick() {
    if (isRemoteOnly) {
      downloadMutation.mutate();
    } else if (resumeId && !isSelected) {
      selectMutation.mutate();
    }
  }

  return (
    <Card.Root
      cursor={isActionable ? 'pointer' : 'default'}
      outline="2px solid"
      outlineColor={isSelected ? 'blue.500' : 'transparent'}
      overflow="hidden"
      onClick={handleClick}
    >
      {isLoading ? (
        <Center h="sm" w="full">
          <Spinner size="sm" />
        </Center>
      ) : templateContent ? (
        <ReadonlyResumePreview
          template={templateContent as Template}
          sections={DEFAULT_TEMPLATE_SECTIONS}
          profile={DEFAULT_TEMPLATE_PROFILE}
          h="sm"
        />
      ) : (
        <Center h="sm" w="full">
          <Text color="fg.muted">Template not found</Text>
        </Center>
      )}
      <Card.Body gap="xs">
        <HStack justify="space-between" align="flex-start">
          <Card.Title>{template.title || template.id}</Card.Title>
          {isRemoteOnly ? (
            <Badge colorPalette="blue" size="sm" flexShrink={0}>
              Remote
            </Badge>
          ) : (
            <Badge colorPalette="green" size="sm" flexShrink={0}>
              Downloaded
            </Badge>
          )}
        </HStack>
        {template.description && <Card.Description>{template.description}</Card.Description>}
      </Card.Body>
    </Card.Root>
  );
});
