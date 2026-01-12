import { Group, HStack, Input } from '@chakra-ui/react';
import type { Control, UseFormRegister } from 'react-hook-form';

import {
  SortableListInput,
  useSortableListInput,
  useSortableListInputItem,
} from '@/components/custom/sortable-list-input';

/**
 * PersonAvatarInput Component
 *
 * Input component for adding and managing people (referrals, interviewers, etc.)
 * using a sortable list with name and contact fields.
 */

interface PersonAvatarInputProps<T extends Record<string, unknown>> {
  control: Control<T>;
  register: UseFormRegister<T>;
  name: string;
  label?: string;
}

function PersonListItem() {
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

export function PersonAvatarInput<T extends Record<string, unknown>>({
  control,
  register,
  name,
  label = 'People',
}: PersonAvatarInputProps<T>) {
  return (
    <SortableListInput.Root
      control={control}
      register={register}
      name={name as never}
      defaultItem={{ name: '', contact: '' } as never}
    >
      <HStack justify="space-between">
        <SortableListInput.Label>{label}</SortableListInput.Label>
        <SortableListInput.AddButton />
      </HStack>
      <SortableListInput.List>
        <PersonListItem />
      </SortableListInput.List>
    </SortableListInput.Root>
  );
}
