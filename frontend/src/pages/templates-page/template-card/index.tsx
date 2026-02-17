import { Badge, Button, Card, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memo } from 'react';
import { useNavigate } from 'react-router';

import { ReadonlyResumePreview } from '@/components/shared/resume-preview';
import { toaster } from '@/components/ui/toaster';
import { DEFAULT_TEMPLATE_PROFILE, DEFAULT_TEMPLATE_SECTIONS } from '@/constants/templates';
import { templateQueries } from '@/queries/template';
import { downloadRemoteTemplate } from '@/services/templates';
import type { Template, TemplateSummary } from '@/types/template';

type TemplateCardProps = {
  template: TemplateSummary;
};

export const TemplateCard = memo(function TemplateCard({ template }: TemplateCardProps) {
  const navigate = useNavigate();
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

  const handleSelect = () => {
    // Navigate to template builder with selected template
    navigate(`/template-builder?template=${template.id}&source=${template.source}`);
  };

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  const getSourceBadgeLabel = () => {
    switch (template.source) {
      case 'local':
        return 'Local';
      case 'remote':
        return 'Remote';
      case 'both':
        return 'Downloaded';
      default:
        return template.source;
    }
  };

  const getSourceBadgeColor = () => {
    switch (template.source) {
      case 'local':
        return 'green';
      case 'remote':
        return 'blue';
      case 'both':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Card.Root>
      <VStack
        h="sm"
        bg="gray.100"
        _dark={{ bg: 'gray.800' }}
        w="full"
        align="stretch"
        p="0"
        position="relative"
        overflow="hidden"
      >
        {isLoading ? (
          <Center h="full" w="full">
            <Spinner size="sm" />
          </Center>
        ) : templateContent ? (
          <ReadonlyResumePreview
            template={templateContent as Template}
            sections={DEFAULT_TEMPLATE_SECTIONS}
            profile={DEFAULT_TEMPLATE_PROFILE}
          />
        ) : (
          <Center h="full" w="full">
            <Text color="fg.muted">Template not found</Text>
          </Center>
        )}
      </VStack>
      <Card.Body gap="2" display="flex" flexDirection="column">
        <Card.Title>{template.title || template.id}</Card.Title>
        {template.description && <Card.Description>{template.description}</Card.Description>}
        <Badge colorScheme={getSourceBadgeColor()} width="fit-content" mt="auto">
          {getSourceBadgeLabel()}
        </Badge>
      </Card.Body>
      <Card.Footer gap="2">
        {template.source === 'remote' ? (
          <Button
            variant="solid"
            flex="1"
            onClick={handleDownload}
            loading={downloadMutation.isPending}
          >
            Download
          </Button>
        ) : template.source === 'both' ? (
          <Button variant="solid" flex="1" onClick={handleSelect} disabled>
            Downloaded
          </Button>
        ) : (
          <Button variant="solid" flex="1" onClick={handleSelect}>
            Use Template
          </Button>
        )}
      </Card.Footer>
    </Card.Root>
  );
});
