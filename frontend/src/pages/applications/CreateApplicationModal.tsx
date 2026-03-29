import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Icon,
  Portal,
  RadioCard,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuCopy, LuFileText, LuSparkles, LuTriangleAlert } from 'react-icons/lu';
import { useParams } from 'react-router';

import { useCreateApplication } from '@/mutations/application.mutations';
import type { ResumeCreationMode } from '@/services/resume.service';

const RESUME_OPTIONS = [
  {
    value: 'default' as const,
    title: 'Copy Default Resume',
    description: 'Start with your default resume template',
    icon: <LuCopy />,
    warning: null,
  },
  {
    value: 'blank' as const,
    title: 'Blank Resume',
    description: 'Create an empty resume from scratch',
    icon: <LuFileText />,
    warning: null,
  },
  {
    value: 'optimized' as const,
    title: 'Optimize for Job',
    description:
      'Automatically populate and optimize resume content for this listing, using your default resume as a base.',
    icon: <LuSparkles />,
    warning: 'This is an experimental feature that may produce poor results. Use with caution.',
  },
];

export function CreateApplicationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { listingId } = useParams<{ listingId: string }>();
  const [resumeMode, setResumeMode] = useState<ResumeCreationMode>('default');

  const createApplicationMutation = useCreateApplication(() => onOpenChange(false));

  const handleConfirm = () => {
    if (listingId) {
      createApplicationMutation.mutateAsync({
        listingId,
        resumeMode,
      });
      setResumeMode('default');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create New Application</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="stretch" gap="lg">
                <VStack align="stretch" gap="sm">
                  <Text fontWeight="medium" fontSize="sm">
                    Resume Setup
                  </Text>
                  <RadioCard.Root
                    value={resumeMode}
                    onValueChange={(e) => setResumeMode(e.value as ResumeCreationMode)}
                    orientation="horizontal"
                    gap="sm"
                    disabled={createApplicationMutation.isPending}
                  >
                    <HStack align="stretch">
                      {RESUME_OPTIONS.map((option) => (
                        <RadioCard.Item key={option.value} value={option.value}>
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <RadioCard.ItemContent>
                              <Icon size="xl" color="fg.muted" mb="xs">
                                {option.icon}
                              </Icon>
                              <RadioCard.ItemText fontSize="sm" fontWeight="medium">
                                {option.title}
                              </RadioCard.ItemText>
                              <RadioCard.ItemDescription fontSize="xs">
                                <Text>{option.description}</Text>
                                {option.warning && (
                                  <Text color="fg.error" mt="xs">
                                    {option.warning}
                                    <Icon size="xs">
                                      <LuTriangleAlert />
                                    </Icon>
                                  </Text>
                                )}
                              </RadioCard.ItemDescription>
                            </RadioCard.ItemContent>
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      ))}
                    </HStack>
                  </RadioCard.Root>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" disabled={createApplicationMutation.isPending}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                onClick={handleConfirm}
                disabled={createApplicationMutation.isPending}
                loading={createApplicationMutation.isPending}
              >
                Create Application
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
