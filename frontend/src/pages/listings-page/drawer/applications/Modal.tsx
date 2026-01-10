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
import { useApplicationMutations } from '@/hooks/applications';
import type {
  Application,
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
  const [selectedStatus, setSelectedStatus] = useState(event.status);
  const [selectedDate, setSelectedDate] = useState(
    isNewEvent ? new Date().toISOString().split('T')[0] : event.date
  );
  const [stage, setStage] = useState(
    event.status === 'interview' ? (event as StatusEventInterview).stage : 1
  );
  const [referral, setReferral] = useState(
    event.status === 'applied' ? (event as StatusEventApplied).referral : undefined
  );
  const [interviewers, setInterviewers] = useState(
    event.status === 'interview' ? (event as StatusEventInterview).interviewers || [] : []
  );

  // Get mutations
  const { createStatusEvent, updateStatusEvent, deleteStatusEvent } = useApplicationMutations();

  const { register, handleSubmit } = useForm<StatusEvent>({
    defaultValues: isNewEvent
      ? {
          id: 'new-event',
          status: 'applied',
          date: new Date().toISOString().split('T')[0] as import('@/utils/date').ISODate,
          notes: '',
        }
      : event,
  });

  const showStageField = selectedStatus === 'interview';

  const statusCollection = createListCollection({
    items: STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  });

  const onSubmit = async (data: StatusEvent) => {
    setIsLoading(true);
    try {
      // Build the event data with the selected status and date
      const eventData: Partial<StatusEvent> = {
        status: selectedStatus,
        date: selectedDate as import('@/utils/date').ISODate,
        notes: data.notes || '',
      };

      // Add status-specific fields
      if (selectedStatus === 'interview') {
        (eventData as StatusEventInterview).stage = stage;
        if (interviewers.length > 0) {
          (eventData as StatusEventInterview).interviewers = interviewers;
        }
      } else if (selectedStatus === 'applied' && referral) {
        (eventData as StatusEventApplied).referral = referral;
      }

      if (!application?.id) {
        throw new Error('Application is required');
      }

      if (isNewEvent) {
        // Don't send id field when creating - backend will generate it
        await createStatusEvent({
          applicationId: application.id,
          statusEvent: eventData as Omit<StatusEvent, 'id'>,
        });
      } else {
        // When editing
        await updateStatusEvent({
          applicationId: application.id,
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
                    <Select.Root
                      size="sm"
                      collection={statusCollection}
                      value={[selectedStatus]}
                      onValueChange={(details) => {
                        setSelectedStatus(details.value[0] as StatusEvent['status']);
                      }}
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
                      <NumberInput.Root
                        size="sm"
                        value={String(stage)}
                        min={1}
                        max={100}
                        onValueChange={(details) => {
                          const num = parseInt(details.value, 10);
                          if (!isNaN(num) && num >= 1 && num <= 100) {
                            setStage(num);
                          }
                        }}
                      >
                        <NumberInput.Control />
                        <NumberInput.Input placeholder="Stage number" />
                      </NumberInput.Root>
                    </Field.Root>
                  )}

                  <Field.Root flex="1">
                    <Field.Label>Date</Field.Label>
                    <Input
                      type="date"
                      size="sm"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
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
                {selectedStatus === 'applied' && (
                  <Field.Root>
                    <Field.Label>Add Referrals</Field.Label>
                    <PersonAvatarInput
                      people={referral ? [referral] : []}
                      onAddPerson={(person) => {
                        // Backend only supports single referral
                        setReferral(person);
                      }}
                      onRemovePerson={() => {
                        setReferral(undefined);
                      }}
                    />
                  </Field.Root>
                )}

                {/* Interviewers */}
                {showStageField && (
                  <Field.Root>
                    <Field.Label>Add Interviewers</Field.Label>
                    <PersonAvatarInput
                      people={interviewers}
                      onAddPerson={(person) => {
                        setInterviewers([...interviewers, person]);
                      }}
                      onRemovePerson={(index) => {
                        setInterviewers(
                          interviewers.filter((_: unknown, i: number) => i !== index)
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
