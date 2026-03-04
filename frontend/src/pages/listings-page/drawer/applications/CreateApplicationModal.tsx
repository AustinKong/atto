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
import { LuCopy, LuFileText, LuSearch } from 'react-icons/lu';
import { useParams } from 'react-router';

import { type ResumeSetupOption, useCreateApplication } from '@/mutations/applications';

const RESUME_OPTIONS = [
  {
    value: 'default' as const,
    title: 'Copy Default Resume',
    description: 'Start with your default resume template',
    icon: <LuCopy />,
  },
  {
    value: 'blank' as const,
    title: 'Blank Resume',
    description: 'Create an empty resume from scratch',
    icon: <LuFileText />,
  },
  {
    value: 'tailored' as const,
    title: 'Tailor to Job Listing',
    description: 'Automatically tailor resume content to this job (not available yet)',
    icon: <LuSearch />,
    disabled: true,
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
  const [resumeSetup, setResumeSetup] = useState<ResumeSetupOption>('default');

  const createApplicationMutation = useCreateApplication();

  const handleConfirm = () => {
    if (listingId) {
      createApplicationMutation.mutateAsync({
        listingId,
        resumeSetup,
      });
      setResumeSetup('default');
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
              <VStack align="stretch" gap="6">
                <VStack align="stretch" gap="3">
                  <Text fontWeight="medium" fontSize="sm">
                    Resume Setup
                  </Text>
                  <RadioCard.Root
                    value={resumeSetup}
                    onValueChange={(e) => setResumeSetup(e.value as ResumeSetupOption)}
                    orientation="horizontal"
                    gap="3"
                    disabled={createApplicationMutation.isPending}
                  >
                    <HStack align="stretch">
                      {RESUME_OPTIONS.map((option) => (
                        <RadioCard.Item
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <RadioCard.ItemContent>
                              <Icon size="xl" color="fg.muted" mb="2">
                                {option.icon}
                              </Icon>
                              <RadioCard.ItemText fontSize="sm" fontWeight="medium">
                                {option.title}
                              </RadioCard.ItemText>
                              <RadioCard.ItemDescription fontSize="xs">
                                {option.description}
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
