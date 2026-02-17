import { Button, Center, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
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

  const currentData = templateSource === 'local' ? localData : remoteData;
  const templates = currentData?.items || [];
  const totalPages = currentData?.pages || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <VStack h="full" alignItems="stretch" gap="6" p="6">
      <VStack alignItems="flex-start" gap="4">
        <div>
          <Text fontSize="2xl" fontWeight="bold" mb="2">
            Resume Templates
          </Text>
          <Text color="fg.muted">Choose a template to customize your resume</Text>
        </div>
        <div>
          <Button
            variant={templateSource === 'remote' ? 'solid' : 'ghost'}
            onClick={() => {
              setTemplateSource('remote');
              setPage(1);
            }}
            mr="2"
          >
            Remote Templates
          </Button>
          <Button
            variant={templateSource === 'local' ? 'solid' : 'ghost'}
            onClick={() => {
              setTemplateSource('local');
              setPage(1);
            }}
          >
            Local Templates
          </Button>
        </div>
      </VStack>

      {templates.length === 0 ? (
        <Center h="200px">
          <Text color="fg.muted">No templates found</Text>
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6" w="full" overflowY="auto">
            {templates.map((template: TemplateSummary) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </SimpleGrid>

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
        </>
      )}
    </VStack>
  );
}
