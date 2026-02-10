import { Button, Center, Text, VStack } from '@chakra-ui/react';
import type { RefObject } from 'react';
import { useParams } from 'react-router';

import type { SectionsEditorHandle } from '@/components/shared/sections-editor';
import { useGenerateResumeContent, usePopulateResumeBaseSections } from '@/mutations/resume';

export function Generate({
  sectionsEditorRef,
}: {
  sectionsEditorRef: RefObject<SectionsEditorHandle | null>;
}) {
  const { resumeId } = useParams<{ resumeId: string }>();
  const generateMutation = useGenerateResumeContent();
  const populateMutation = usePopulateResumeBaseSections({
    onSuccess: () => {
      // TODO: Change to passing in fn instead of passing entire ref
      sectionsEditorRef.current?.reset();
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
