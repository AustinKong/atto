import { Card, Center, Float, IconButton, Spinner, Text } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memo } from 'react';
import { LuDownload } from 'react-icons/lu';
import { PiStar, PiStarFill } from 'react-icons/pi';

import { ReadonlyResumePreview } from '@/components/shared/resume-preview';
import { toaster } from '@/components/ui/toaster';
import { DEFAULT_TEMPLATE_PROFILE, DEFAULT_TEMPLATE_SECTIONS } from '@/constants/templates';
import { templateQueries } from '@/queries/template';
import { downloadRemoteTemplate, setDefaultTemplate } from '@/services/templates';
import type { Template, TemplateSummary } from '@/types/template';

type TemplateCardProps = {
  template: TemplateSummary;
  isSelected?: boolean;
};

export const TemplateCard = memo(function TemplateCard({
  template,
  isSelected,
}: TemplateCardProps) {
  const queryClient = useQueryClient();

  // Fetch the actual template HTML content
  const queryOption =
    template.source === 'local'
      ? templateQueries.localItem(template.id)
      : templateQueries.remoteItem(template.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: templateContent, isLoading } = useQuery(queryOption as any);

  const downloadMutation = useMutation({
    mutationFn: () => downloadRemoteTemplate(template.id),
    onSuccess: () => {
      toaster.success({
        title: 'Template downloaded',
        description: `${template.title || template.id} has been downloaded successfully.`,
      });
      // Invalidate both local and remote template lists to refresh source badges
      queryClient.invalidateQueries({ queryKey: ['templates', 'list', 'local'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'remote', 'list'] });
    },
    onError: (error: Error) => {
      toaster.error({
        title: 'Failed to download template',
        description: error.message,
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: () => setDefaultTemplate(template.id),
    onSuccess: () => {
      // Invalidate the default template query and both template lists to refresh UI
      queryClient.invalidateQueries({ queryKey: ['templates', 'default'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'list', 'local'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'remote', 'list'] });
    },
    onError: (error: Error) => {
      toaster.error({
        title: 'Failed to set default template',
        description: error.message,
      });
    },
  });

  const handleSelect = () => {
    // Set as default template
    setDefaultMutation.mutate();
    // Navigate to template builder with selected template
    // navigate(`/template-builder?template=${template.id}&source=${template.source}`);
  };

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  return (
    <Card.Root
      outline="2px solid"
      outlineColor={isSelected ? 'blue.500' : 'transparent'}
      overflow="hidden"
    >
      {/* <VStack
        h="sm"
        bg="gray.100"
        _dark={{ bg: 'gray.800' }}
        w="full"
        align="stretch"
        p="0"
        position="relative"
        overflow="hidden"
      > */}
      {isLoading ? (
        <Center h="full" w="full">
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
        <Center h="full" w="full">
          <Text color="fg.muted">Template not found</Text>
        </Center>
      )}
      <Float placement="top-end" offset="8">
        {template.source === 'remote' ? (
          <IconButton
            aria-label="Download template"
            onClick={handleDownload}
            loading={downloadMutation.isPending}
            variant="ghost"
            size="lg"
          >
            <LuDownload />
          </IconButton>
        ) : isSelected ? (
          <IconButton
            aria-label="Default template"
            variant="ghost"
            size="lg"
            disabled
            _disabled={{ opacity: 1 }}
          >
            <PiStarFill />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Set as default"
            onClick={handleSelect}
            loading={setDefaultMutation.isPending}
            variant="ghost"
            size="lg"
          >
            <PiStar />
          </IconButton>
        )}
      </Float>
      {/* </VStack> */}
      <Card.Body gap="2">
        <Card.Title>{template.title || template.id}</Card.Title>
        {template.description && <Card.Description>{template.description}</Card.Description>}
      </Card.Body>
    </Card.Root>
  );
});
