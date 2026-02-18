import { Box, Button, Center, SimpleGrid, Stack, Tabs, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { templateQueries } from '@/queries/template';
import type { TemplateSummary } from '@/types/template';

import { TemplateCard } from './template-card';

export function TemplatesPage() {
  const [templateSource, setTemplateSource] = useState<'local' | 'remote'>('remote');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: localData } = useSuspenseQuery(templateQueries.list(page, PAGE_SIZE));
  const { data: remoteData } = useSuspenseQuery(templateQueries.remoteList(page, PAGE_SIZE));
  const { data: defaultTemplateData } = useSuspenseQuery(templateQueries.default());

  const currentData = templateSource === 'local' ? localData : remoteData;
  const templates = currentData?.items || [];
  const totalPages = currentData?.pages || 1;
  const defaultTemplateId = defaultTemplateData?.template_id;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <VStack h="full" alignItems="stretch" gap="0" p="0">
      <Tabs.Root
        value={templateSource}
        onValueChange={(details) => {
          setTemplateSource(details.value as 'local' | 'remote');
          setPage(1);
        }}
        variant="outline"
      >
        <Tabs.List>
          <Tabs.Trigger value="remote">Remote Templates</Tabs.Trigger>
          <Tabs.Trigger value="local">Local Templates</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <Box flex="1" overflowY="auto" p="6">
        {templates.length === 0 ? (
          <Center h="200px">
            <Text color="fg.muted">No templates found</Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6" w="full">
            {templates.map((template: TemplateSummary) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={defaultTemplateId === template.id}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {totalPages > 1 && (
        <Stack direction="row" justify="center" gap="2" mt="4">
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
