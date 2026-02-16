import { Button, Center, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { templateQueries } from '@/queries/template';

import { TemplateCard } from './template-card';

export function TemplatesPage() {
  const [templateSource, setTemplateSource] = useState<'local' | 'remote'>('remote');

  const { data: templates = [] } = useSuspenseQuery(templateQueries.list());

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
            onClick={() => setTemplateSource('remote')}
            mr="2"
          >
            Remote Templates
          </Button>
          <Button
            variant={templateSource === 'local' ? 'solid' : 'ghost'}
            onClick={() => setTemplateSource('local')}
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6" w="full" overflowY="auto">
          {templates.map((template: string) => (
            <TemplateCard key={template} template={template} source={templateSource} />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}
