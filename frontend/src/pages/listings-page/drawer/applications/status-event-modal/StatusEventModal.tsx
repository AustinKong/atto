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
  contact: z.string().nullable(),
  avatarUrl: z.string().nullable(),
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
  return {
    status: event?.status || 'applied',
    date: event?.date || ISODate.today(),
    notes: event?.notes || '',
    stage: event && event.status === 'interview' ? (event as StatusEventInterview).stage : 1,
    referrals: event && event.status === 'applied' ? (event as StatusEventApplied).referrals : [],
    interviewers:
      event && event.status === 'interview' ? (event as StatusEventInterview).interviewers : [],
    scheduledAt:
      event && event.status === 'interview' && (event as StatusEventInterview).scheduledAt
        ? ISODatetime.toLocalInput((event as StatusEventInterview).scheduledAt!)
        : '',
    location:
      event && event.status === 'interview' ? (event as StatusEventInterview).location || '' : '',
  };
}

export function StatusEventModal() {
  const { dialog, context, close } = useStatusEvent();

  const event = context?.event;
  const application = context?.application;
  const isNewEvent = !event;

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
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(statusEventSchema),
    mode: 'onChange',
    values: getFormValues(event),
  });

  const selectedStatus = watch('status');

  const onSubmit = async (data: FormValues) => {
    if (!application) return;
    const { date, notes, status } = data;
    const base = { date: date as ISODate, notes: notes || '', status };
    let payload: Omit<StatusEvent, 'id'>;

    switch (status) {
      case 'interview':
        payload = {
          ...base,
          stage: data.stage,
          interviewers: data.interviewers,
          scheduledAt: data.scheduledAt ? ISODatetime.fromLocalInput(data.scheduledAt) : null,
        } as StatusEventInterview;
        break;
      case 'applied':
        payload = {
          ...base,
          referrals: data.referrals,
        } as StatusEventApplied;
        break;
      default:
        payload = base as Omit<StatusEvent, 'id'>;
    }

    if (isNewEvent) {
      await createStatusEvent({
        applicationId: application.id,
        listingId: application.listingId,
        statusEvent: payload,
      });
    } else {
      await updateStatusEvent({
        applicationId: application.id,
        listingId: application.listingId,
        eventId: event.id,
        statusEvent: payload,
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
    <Dialog.RootProvider value={dialog} onExitComplete={() => reset()}>
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
