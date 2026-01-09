import {
  Button,
  CloseButton,
  createListCollection,
  Dialog,
  Field,
  HStack,
  Input,
  NumberInput,
  Portal,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { STATUS_OPTIONS } from '@/constants/statuses';
import { createStatusEvent, deleteStatusEvent, updateStatusEvent } from '@/services/applications';
import type { StatusEvent, StatusEventApplied, StatusEventInterview } from '@/types/application';

import { PersonAvatarInput } from './PersonAvatarInput';

/**
 * ApplicationModal Component
 *
 * Modal for creating and editing application timeline events.
 * Supports different fields based on event status (e.g., stage for interviews,
 * referrers for applied status, etc.)
 */

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  event: StatusEvent;
  applicationId: string;
  isNewEvent?: boolean;
  onSuccess?: () => void;
}

export function ApplicationModal({
  open,
  onOpenChange,
  event,
  applicationId,
  isNewEvent = false,
  onSuccess,
}: ApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, watch, handleSubmit } = useForm<StatusEvent>({
    defaultValues: isNewEvent
      ? {
          id: 'new-event',
          status: 'applied',
          createdAt: new Date().toISOString(),
          notes: '',
        }
      : event,
  });

  const currentStatus = watch('status');
  const showStageField = currentStatus === 'interview';

  const statusCollection = createListCollection({
    items: STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  });

  const dateValue = isNewEvent
    ? new Date().toISOString().split('T')[0]
    : event.createdAt.split('T')[0];

  const onSubmit = async (data: StatusEvent) => {
    setIsLoading(true);
    try {
      if (isNewEvent) {
        await createStatusEvent(applicationId, data);
      } else {
        await updateStatusEvent(applicationId, event.id, data);
      }
      onSuccess?.();
      onOpenChange({ open: false });
    } catch (error) {
      console.error('Failed to save status event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await deleteStatusEvent(applicationId, event.id);
      onSuccess?.();
      onOpenChange({ open: false });
    } catch (error) {
      console.error('Failed to delete status event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size={{ mdDown: 'full', md: 'lg' }}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{isNewEvent ? 'Create' : 'Edit'} Timeline Event</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body pb="8">
              <VStack gap="4" as="form" align="stretch">
                {/* Status, Stage, and Date - Side by Side */}
                <HStack gap="4" align="flex-end">
                  <Field.Root flex="2">
                    <Field.Label>Status</Field.Label>
                    <Select.Root
                      size="sm"
                      collection={statusCollection}
                      defaultValue={[currentStatus]}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner zIndex="popover">
                        <Select.Content>
                          {statusCollection.items.map(
                            (item: (typeof statusCollection.items)[0]) => (
                              <Select.Item key={item.value} item={item}>
                                {item.label}
                              </Select.Item>
                            )
                          )}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Field.Root>

                  {showStageField && (
                    <Field.Root flex="1">
                      <Field.Label>Stage</Field.Label>
                      <NumberInput.Root size="sm" defaultValue="">
                        <NumberInput.Control />
                        <NumberInput.Input placeholder="Stage number" />
                      </NumberInput.Root>
                    </Field.Root>
                  )}

                  <Field.Root flex="1">
                    <Field.Label>Date</Field.Label>
                    <Input type="date" size="sm" defaultValue={dateValue} />
                  </Field.Root>
                </HStack>

                {/* Notes */}
                <Field.Root>
                  <Field.Label>Notes</Field.Label>
                  <Textarea
                    placeholder="Add notes..."
                    size="sm"
                    autoresize
                    {...register('notes')}
                  />
                </Field.Root>

                {/* Referrals */}
                {event.status === 'applied' && (
                  <Field.Root>
                    <Field.Label>Add Referrals</Field.Label>
                    <PersonAvatarInput
                      people={event.referral ? [event.referral] : []}
                      onAddPerson={(person) => {
                        // Backend only supports single referral
                        (event as StatusEventApplied).referral = person;
                      }}
                      onRemovePerson={() => {
                        (event as StatusEventApplied).referral = undefined;
                      }}
                    />
                  </Field.Root>
                )}

                {/* Interviewers */}
                {showStageField && (
                  <Field.Root>
                    <Field.Label>Add Interviewers</Field.Label>
                    <PersonAvatarInput
                      people={(event as StatusEventInterview).interviewers || []}
                      onAddPerson={(person) => {
                        const current = (event as StatusEventInterview).interviewers || [];
                        (event as StatusEventInterview).interviewers = [...current, person];
                      }}
                      onRemovePerson={(index) => {
                        const current = (event as StatusEventInterview).interviewers || [];
                        (event as StatusEventInterview).interviewers = current.filter(
                          (_: unknown, i: number) => i !== index
                        );
                      }}
                    />
                  </Field.Root>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              {!isNewEvent && (
                <Button variant="outline" colorPalette="red" onClick={onDelete} loading={isLoading}>
                  Delete
                </Button>
              )}
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleSubmit(onSubmit)} loading={isLoading}>
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
