import { Button, Card, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { useNavigate } from 'react-router';

import { ReadonlyResumePreview } from '@/components/shared/resume-preview';
import { templateQueries } from '@/queries/template';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import { ISOYearMonth } from '@/utils/date';

type TemplateCardProps = {
  template: string | { name: string; description?: string };
  source: 'local' | 'remote';
};

// Default sample profile for template preview
const DEFAULT_SAMPLE_PROFILE: Profile = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  website: '',
  baseSections: [],
};

// Default sample sections for template preview
const DEFAULT_SAMPLE_SECTIONS: Section[] = [
  {
    id: 'exp-1',
    type: 'detailed',
    title: 'Experience',
    content: [
      {
        title: 'Senior Software Engineer',
        subtitle: 'Tech Company',
        startDate: '2020-01' as ISOYearMonth,
        endDate: null,
        bullets: ['Led team of 5 engineers', 'Improved performance by 40%'],
      },
    ],
  },
  {
    id: 'edu-1',
    type: 'detailed',
    title: 'Education',
    content: [
      {
        title: 'Bachelor of Science',
        subtitle: 'Computer Science, University',
        startDate: '2015-09' as ISOYearMonth,
        endDate: '2019-05' as ISOYearMonth,
        bullets: [],
      },
    ],
  },
];

// A4 aspect ratio: width / height = 210 / 297 ≈ 0.707
const A4_ASPECT_RATIO = 210 / 297;

export const TemplateCard = memo(function TemplateCard({ template, source }: TemplateCardProps) {
  const navigate = useNavigate();
  const templateName = typeof template === 'string' ? template : template.name;
  const templateDescription = typeof template === 'string' ? undefined : template.description;

  // Fetch the actual template HTML content
  const { data: templateContent, isLoading } = useQuery(templateQueries.item(templateName));

  // TODO: Add virtualization for fetching and rendering templates

  const handleSelect = () => {
    // Navigate to template builder with selected template
    navigate(`/template-builder?template=${templateName}&source=${source}`);
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
            template={templateContent}
            sections={DEFAULT_SAMPLE_SECTIONS}
            profile={DEFAULT_SAMPLE_PROFILE}
          />
        ) : (
          <Center h="full" w="full">
            <Text color="fg.muted">Template not found</Text>
          </Center>
        )}
      </VStack>
      <Card.Body gap="2" display="flex" flexDirection="column">
        <Card.Title>{templateName}</Card.Title>
        {templateDescription && <Card.Description>{templateDescription}</Card.Description>}
        <Text textStyle="sm" color="fg.muted" mt="auto">
          {source === 'remote' ? 'Community Template' : 'Local Template'}
        </Text>
      </Card.Body>
      <Card.Footer gap="2">
        <Button variant="solid" flex="1" onClick={handleSelect}>
          Use Template
        </Button>
      </Card.Footer>
    </Card.Root>
  );
});
