import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { STATUS_DEFINITIONS } from '@/constants/statuses';
import { useApplicationMutations } from '@/hooks/applications';
import type { StatusEvent, StatusEventApplied, StatusEventInterview } from '@/types/application';
import { ISODate, ISODatetime } from '@/utils/date';

import { FormFields } from './FormFields';
import { useStatusEvent } from './statusEventContext';

const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const statusValues = Object.keys(STATUS_DEFINITIONS) as [
  keyof typeof STATUS_DEFINITIONS,
  ...Array<keyof typeof STATUS_DEFINITIONS>,
];

const statusEventSchema = z.object({
  status: z.enum(statusValues),
  date: z.custom<ISODate>((val) => typeof val === 'string'),
  notes: z.string(),
  stage: z.number().min(1).max(100),
  referrals: z.array(personSchema),
  interviewers: z.array(personSchema),
  scheduledAt: z.string(),
  location: z.string(),
});

export type FormValues = z.infer<typeof statusEventSchema>;

function getFormValues(event?: StatusEvent): FormValues {
  if (!event) {
    return {
      status: 'applied',
      date: ISODate.today(),
      notes: '',
      stage: 1,
      referrals: [],
      interviewers: [],
      scheduledAt: '',
      location: '',
    };
  }

  return {
    status: event.status,
    date: event.date,
    notes: event.notes || '',
    stage: event.status === 'interview' ? (event as StatusEventInterview).stage : 1,
    referrals: event.status === 'applied' ? (event as StatusEventApplied).referrals || [] : [],
    interviewers:
      event.status === 'interview' ? (event as StatusEventInterview).interviewers || [] : [],
    scheduledAt:
      event.status === 'interview' && (event as StatusEventInterview).scheduledAt
        ? ISODatetime.toLocalInput((event as StatusEventInterview).scheduledAt!)
        : '',
    location: event.status === 'interview' ? (event as StatusEventInterview).location || '' : '',
  };
}

export function StatusEventModal() {
  const { dialog, context, close } = useStatusEvent();

  const event = context?.event;
  const application = context?.application;
  const isNewEvent = !event;

  // Get mutations
  const {
    createStatusEvent,
    isCreateStatusEventLoading,
    updateStatusEvent,
    isUpdateStatusEventLoading,
    deleteStatusEvent,
    isDeleteStatusEventLoading,
  } = useApplicationMutations();

  const isLoading =
    isCreateStatusEventLoading || isUpdateStatusEventLoading || isDeleteStatusEventLoading;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(statusEventSchema),
    mode: 'onChange',
    values: getFormValues(event),
  });

  const selectedStatus = watch('status');

  // TODO: Move mapping logic into a function outside the component. Similar to new-listings-page/details/index.tsx
  const onSubmit = async (data: FormValues) => {
    console.log(data);
    if (!application || !event) return;

    // Build the event data with the selected status and date
    const eventData: Partial<StatusEvent> = {
      status: selectedStatus,
      date: data.date as ISODate,
      notes: data.notes || '',
    };

    // Add status-specific fields
    if (selectedStatus === 'interview') {
      (eventData as StatusEventInterview).stage = data.stage;
      (eventData as StatusEventInterview).interviewers = data.interviewers;
      if (data.scheduledAt) {
        (eventData as StatusEventInterview).scheduledAt = ISODatetime.fromLocalInput(
          data.scheduledAt
        );
      }
      if (data.location) {
        (eventData as StatusEventInterview).location = data.location;
      }
    } else if (selectedStatus === 'applied') {
      (eventData as StatusEventApplied).referrals = data.referrals;
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
    close();
  };

  const onDelete = async () => {
    if (!application || !event) return;

    await deleteStatusEvent({
      applicationId: application.id,
      listingId: application.listingId,
      eventId: event.id,
    });
    close();
  };

  return (
    <Dialog.RootProvider value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content as="form" onSubmit={handleSubmit(onSubmit)}>
            <Dialog.Header>
              <Dialog.Title>{isNewEvent ? 'Create' : 'Edit'} Timeline Event</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb="8">
              <FormFields
                control={control}
                register={register}
                selectedStatus={selectedStatus}
                errors={errors}
              />
            </Dialog.Body>
            <Dialog.Footer>
              {!isNewEvent && (
                <Button variant="outline" colorPalette="red" onClick={onDelete} loading={isLoading}>
                  Delete
                </Button>
              )}
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" disabled={isLoading} onClick={close}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button type="submit" loading={isLoading}>
                Save
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild onClick={close}>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
