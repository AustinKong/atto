import { Box, Button, Center, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { resumeQueries } from '@/queries/resume.queries';
import { templateQueries } from '@/queries/template.queries';
import type { TemplateSummary } from '@/types/template.types';

import { TemplateCard } from './template-card';

// TODO: Add paginated infinite scroll
export function TemplatesPage() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const { resumeId } = useParams<{ resumeId: string }>();
  const isPickerMode = !!resumeId;

  const { data } = useSuspenseQuery(templateQueries.list(page, PAGE_SIZE));
  const { data: resume } = useQuery({
    ...resumeQueries.item(resumeId!),
    enabled: isPickerMode,
  });

  const templates = data?.items || [];
  const totalPages = data?.pages || 1;
  const selectedTemplateId = isPickerMode ? resume?.templateId : undefined;

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }

  return (
    <VStack h="full" alignItems="stretch" gap="0" p="0">
      {isPickerMode && (
        <Box borderBottom="subtle" px="lg" py="sm">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            ← Back to Resume
          </Button>
        </Box>
      )}
      <Box flex="1" overflowY="auto" p="lg">
        {templates.length === 0 ? (
          <Center h="200px">
            <Text color="fg.muted">No templates found</Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="lg" w="full">
            {templates.map((template: TemplateSummary) => (
              <TemplateCard
                key={template.id}
                template={template}
                resumeId={isPickerMode ? resumeId : undefined}
                isSelected={selectedTemplateId === template.id}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {totalPages > 1 && (
        <Stack direction="row" justify="center" gap="xs" mt="md">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Text alignSelf="center" fontSize="sm">
            Page {page} of {totalPages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </Stack>
      )}
    </VStack>
  );
}
