import {
  Button,
  CloseButton,
  createListCollection,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { STATUS_OPTIONS } from '@/constants/statuses';
import { useApplicationMutations } from '@/hooks/applications';
import type {
  Application,
  Person,
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application';

import { PersonAvatarInput } from './PersonAvatarInput';

/**
 * ApplicationModal Component
 *
 * Modal for creating and editing application timeline events.
 * Supports different fields based on event status (e.g., stage for interviews,
 * referrers for applied status, etc.)
 *
 * Uses a managed entity pattern: accepts optional Application object.
 * When provided, uses the application's ID for mutations.
 */

interface FormValues extends Record<string, unknown> {
  status: StatusEvent['status'];
  date: string;
  notes: string;
  stage: number;
  referrals: Person[];
  interviewers: Person[];
}

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  event: StatusEvent;
  application?: Application;
  isNewEvent?: boolean;
}

export function ApplicationModal({
  open,
  onOpenChange,
  event,
  application,
  isNewEvent = false,
}: ApplicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get mutations
  const { createStatusEvent, updateStatusEvent, deleteStatusEvent } = useApplicationMutations();

  const { register, handleSubmit, control, reset, watch } = useForm<FormValues>({
    defaultValues: isNewEvent
      ? {
          status: 'applied',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          stage: 1,
          referrals: [],
          interviewers: [],
        }
      : {
          status: event.status,
          date: event.date,
          notes: event.notes || '',
          stage: event.status === 'interview' ? (event as StatusEventInterview).stage : 1,
          referrals:
            event.status === 'applied' ? (event as StatusEventApplied).referrals || [] : [],
          interviewers:
            event.status === 'interview' ? (event as StatusEventInterview).interviewers || [] : [],
        },
  });

  // Reset form and local state when modal closes OR when event/isNewEvent changes
  useEffect(() => {
    if (!open) {
      reset();
      setIsLoading(false);
    } else {
      // When modal opens, reset form with current event data
      reset(
        isNewEvent
          ? {
              status: 'applied',
              date: new Date().toISOString().split('T')[0],
              notes: '',
              stage: 1,
              referrals: [],
              interviewers: [],
            }
          : {
              status: event.status,
              date: event.date,
              notes: event.notes || '',
              stage: event.status === 'interview' ? (event as StatusEventInterview).stage : 1,
              referrals:
                event.status === 'applied' ? (event as StatusEventApplied).referrals || [] : [],
              interviewers:
                event.status === 'interview'
                  ? (event as StatusEventInterview).interviewers || []
                  : [],
            }
      );
    }
  }, [open, reset, isNewEvent, event]);

  const selectedStatus = watch('status');
  const showStageField = selectedStatus === 'interview';

  const statusCollection = createListCollection({
    items: STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Build the event data with the selected status and date
      const eventData: Partial<StatusEvent> = {
        status: selectedStatus, // Use selectedStatus from state, not data.status
        date: data.date as import('@/utils/date').ISODate,
        notes: data.notes || '',
      };

      // Add status-specific fields
      if (selectedStatus === 'interview') {
        (eventData as StatusEventInterview).stage = data.stage;
        (eventData as StatusEventInterview).interviewers = data.interviewers;
      } else if (selectedStatus === 'applied') {
        (eventData as StatusEventApplied).referrals = data.referrals;
      }

      if (!application?.id) {
        throw new Error('Application is required');
      }

      if (isNewEvent) {
        // Don't send id field when creating - backend will generate it
        await createStatusEvent({
          applicationId: application.id,
          listingId: application.listingId,
          statusEvent: eventData as Omit<StatusEvent, 'id'>,
        });
      } else {
        // When editing
        await updateStatusEvent({
          applicationId: application.id,
          listingId: application.listingId,
          eventId: event.id,
          statusEvent: eventData as Omit<StatusEvent, 'id'>,
        });
      }
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
      if (!application?.id) {
        throw new Error('Application is required');
      }
      await deleteStatusEvent({
        applicationId: application.id,
        listingId: application.listingId,
        eventId: event.id,
      });
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
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select.Root
                          size="sm"
                          collection={statusCollection}
                          name={field.name}
                          value={field.value ? [field.value] : []}
                          onValueChange={({ value }) => field.onChange(value[0])}
                          onInteractOutside={() => field.onBlur()}
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
                      )}
                    />
                  </Field.Root>

                  {showStageField && (
                    <Field.Root flex="1">
                      <Field.Label>Stage</Field.Label>
                      <Input
                        type="number"
                        size="sm"
                        min={1}
                        max={100}
                        placeholder="Stage number"
                        {...register('stage', { valueAsNumber: true })}
                      />
                    </Field.Root>
                  )}

                  <Field.Root flex="1">
                    <Field.Label>Date</Field.Label>
                    <Input type="date" size="sm" {...register('date')} />
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

                {/* People (Referrals or Interviewers based on status) */}
                {(selectedStatus === 'applied' || selectedStatus === 'interview') && (
                  <PersonAvatarInput<FormValues>
                    control={control}
                    register={register}
                    name={selectedStatus === 'applied' ? 'referrals' : 'interviewers'}
                    label={selectedStatus === 'applied' ? 'Referrals' : 'Interviewers'}
                  />
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
