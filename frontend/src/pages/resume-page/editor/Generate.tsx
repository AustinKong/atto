import { Button, Center, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router';

import { useGenerateResumeContent, usePopulateResumeBaseSections } from '@/mutations/resume';
import type { Section } from '@/types/resume';

export function Generate({ onResetSections }: { onResetSections: (sections: Section[]) => void }) {
  const { resumeId } = useParams<{ resumeId: string }>();
  const generateMutation = useGenerateResumeContent({
    onSuccess: (sections) => {
      onResetSections(sections);
    },
  });
  const populateMutation = usePopulateResumeBaseSections({
    onSuccess: (sections) => {
      onResetSections(sections);
    },
  });

  const handlePopulateBaseSections = () => {
    if (!resumeId) return;
    populateMutation.mutate(resumeId);
  };

  const handleGenerateContent = () => {
    if (!resumeId) return;
    generateMutation.mutate(resumeId);
  };

  return (
    <Center h="full">
      <VStack gap="4">
        <Text fontSize="lg" fontWeight="medium">
          Generate Resume Content
        </Text>
        <VStack gap="2">
          <Button
            onClick={handlePopulateBaseSections}
            loading={populateMutation.isPending}
            loadingText="Populating..."
            colorScheme="blue"
            size="lg"
          >
            Populate Base Sections
          </Button>
          <Text fontSize="sm" color="gray.600">
            Add your profile's base sections to the resume
          </Text>
        </VStack>
        <VStack gap="2">
          <Button
            onClick={handleGenerateContent}
            loading={generateMutation.isPending}
            loadingText="Generating..."
            colorScheme="green"
            size="lg"
          >
            Generate Full Content
          </Button>
          <Text fontSize="sm" color="gray.600">
            Populate base sections and generate tailored work experience
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}
