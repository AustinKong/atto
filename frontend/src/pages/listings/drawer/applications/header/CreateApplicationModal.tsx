import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Heading,
  HStack,
  Icon,
  Input,
  Portal,
  RadioCard,
  Text,
  VStack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { LuCopy, LuFileText, LuSparkles } from 'react-icons/lu';
import { useParams } from 'react-router';
import { z } from 'zod';

import { useCreateApplication } from '@/mutations/application.mutations';
import type { ResumeCreationMode } from '@/services/resume.service';

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
    value: 'optimized' as const,
    title: 'Optimize for Listing',
    description: 'Optimize resume contents for this listing, using your default resume as a base.',
    icon: <LuSparkles />,
  },
];

const resumeModeValues = RESUME_OPTIONS.map((option) => option.value) as [
  ResumeCreationMode,
  ...ResumeCreationMode[],
];

const createApplicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  resumeMode: z.enum(resumeModeValues),
});

type FormValues = z.infer<typeof createApplicationSchema>;

export function CreateApplicationModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (applicationId: string) => void;
}) {
  const { listingId } = useParams<{ listingId: string }>();
  const defaultValues: FormValues = { name: '', resumeMode: 'default' };
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(createApplicationSchema),
    mode: 'onChange',
  });

  const createApplicationMutation = useCreateApplication((application) => {
    onOpenChange(false);
    onCreated?.(application.id);
    reset(defaultValues);
  });

  const handleConfirm = handleSubmit((values) => {
    if (!listingId) return;

    return createApplicationMutation.mutateAsync({
      listingId,
      name: values.name,
      resumeMode: values.resumeMode,
    });
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="lg"
      placement="center"
    >
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
                <Field.Root required invalid={Boolean(errors.name)}>
                  <Field.Label textStyle="caption">Application Name</Field.Label>
                  <Input
                    placeholder="e.g. Primary application"
                    disabled={createApplicationMutation.isPending}
                    {...register('name')}
                  />
                  {errors.name && <Field.ErrorText>{errors.name.message}</Field.ErrorText>}
                </Field.Root>

                <VStack align="stretch" gap="sm">
                  <Heading textStyle="title-sm">Resume Setup</Heading>
                  <Controller
                    control={control}
                    name="resumeMode"
                    render={({ field }) => (
                      <RadioCard.Root
                        value={field.value}
                        onValueChange={(event) => field.onChange(event.value as ResumeCreationMode)}
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
                                  <RadioCard.ItemText textStyle="body">
                                    {option.title}
                                  </RadioCard.ItemText>
                                  <RadioCard.ItemDescription textStyle="caption">
                                    <Text textStyle="caption">{option.description}</Text>
                                  </RadioCard.ItemDescription>
                                </RadioCard.ItemContent>
                              </RadioCard.ItemControl>
                            </RadioCard.Item>
                          ))}
                        </HStack>
                      </RadioCard.Root>
                    )}
                  />
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
                disabled={createApplicationMutation.isPending || !isValid}
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
