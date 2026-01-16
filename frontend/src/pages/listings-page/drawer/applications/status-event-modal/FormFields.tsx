import {
  createListCollection,
  Field,
  Group,
  HStack,
  Input,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { type Control, Controller, type UseFormRegister } from 'react-hook-form';

import {
  SortableListInput,
  useSortableListInput,
  useSortableListInputItem,
} from '@/components/custom/sortable-list-input';
import { STATUS_OPTIONS } from '@/constants/statuses';
import type { Person } from '@/types/application';

import type { FormValues } from './StatusEventModal';

/**
 * PersonInput Component
 *
 * Input component for adding and managing people (referrals, interviewers, etc.)
 * using a sortable list with name and contact fields.
 */

function PersonInputItem() {
  const { register, name } = useSortableListInput();
  const { index } = useSortableListInputItem();

  return (
    <SortableListInput.Item>
      <Group attached flex="1">
        <Input {...register(`${name}.${index}.name` as const)} placeholder="Enter name" size="sm" />
        <Input
          {...register(`${name}.${index}.contact` as const)}
          placeholder="Email or phone"
          size="sm"
        />
      </Group>
      <SortableListInput.DeleteButton />
    </SortableListInput.Item>
  );
}

function PersonInput({
  control,
  register,
  name,
  label,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  name: 'referrals' | 'interviewers';
  label: string;
}) {
  return (
    <SortableListInput.Root<FormValues>
      control={control}
      register={register}
      name={name}
      defaultItem={{ name: '', contact: '' } as Person}
    >
      <HStack justify="space-between">
        <SortableListInput.Label>{label}</SortableListInput.Label>
        <SortableListInput.AddButton />
      </HStack>
      <SortableListInput.List>
        <PersonInputItem />
      </SortableListInput.List>
    </SortableListInput.Root>
  );
}

const statusCollection = createListCollection({
  items: STATUS_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
});

export function FormFields({
  control,
  register,
  selectedStatus,
  errors,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  selectedStatus: string;
  errors: Partial<Record<keyof FormValues, { message?: string }>>;
}) {
  const showStageField = selectedStatus === 'interview';

  return (
    <VStack gap="4" align="stretch">
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
                    {statusCollection.items.map((item: (typeof statusCollection.items)[0]) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          />
        </Field.Root>

        {showStageField && (
          <Field.Root flex="1" invalid={!!errors.stage}>
            <Field.Label>Stage</Field.Label>
            <Input
              type="number"
              size="sm"
              min={1}
              max={100}
              placeholder="Stage number"
              {...register('stage', { valueAsNumber: true })}
            />
            {errors.stage && <Field.ErrorText>{errors.stage.message}</Field.ErrorText>}
          </Field.Root>
        )}

        <Field.Root flex="1" invalid={!!errors.date}>
          <Field.Label>Date</Field.Label>
          <Input type="date" size="sm" {...register('date')} />
          {errors.date && <Field.ErrorText>{errors.date.message}</Field.ErrorText>}
        </Field.Root>
      </HStack>

      {/* Interview-specific fields: Scheduled Time and Location */}
      {showStageField && (
        <HStack gap="4" align="flex-end">
          <Field.Root flex="1">
            <Field.Label>Scheduled Time</Field.Label>
            <Input
              type="datetime-local"
              size="sm"
              placeholder="Interview time"
              {...register('scheduledAt')}
            />
          </Field.Root>

          <Field.Root flex="1">
            <Field.Label>Location</Field.Label>
            <Input
              type="text"
              size="sm"
              placeholder="e.g., Zoom, Office Room 301"
              {...register('location')}
            />
          </Field.Root>
        </HStack>
      )}

      {/* Notes */}
      <Field.Root>
        <Field.Label>Notes</Field.Label>
        <Textarea placeholder="Add notes..." size="sm" autoresize {...register('notes')} />
      </Field.Root>

      {/* People (Referrals or Interviewers based on status) */}
      {(selectedStatus === 'applied' || selectedStatus === 'interview') && (
        <PersonInput
          control={control}
          register={register}
          name={selectedStatus === 'applied' ? 'referrals' : 'interviewers'}
          label={selectedStatus === 'applied' ? 'Referrals' : 'Interviewers'}
        />
      )}
    </VStack>
  );
}
