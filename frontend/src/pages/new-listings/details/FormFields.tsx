import { Field, HStack, Input, TagsInput, Textarea } from '@chakra-ui/react';
import { type Control, Controller, type UseFormRegister } from 'react-hook-form';
import { PiCheck } from 'react-icons/pi';

import { SortableListInput } from '@/components/custom/sortable-list-input';

import type { FormValues } from '.';

export function FormFields({
  control,
  register,
  isReadOnly,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  isReadOnly: boolean;
}) {
  return (
    <>
      <Field.Root readOnly={isReadOnly}>
        <Field.Label textStyle="caption">Company</Field.Label>
        <Input {...register('company')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label textStyle="caption">Role</Field.Label>
        <Input {...register('title')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label textStyle="caption">Location</Field.Label>
        <Input {...register('location')} />
      </Field.Root>

      <Field.Root readOnly={isReadOnly}>
        <Field.Label textStyle="caption">Posted Date</Field.Label>
        <Input type="date" {...register('postedDate')} />
      </Field.Root>

      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <TagsInput.Root
            value={field.value}
            onValueChange={(details) => field.onChange(details.value)}
            onBlur={field.onBlur}
            readOnly={isReadOnly}
            editable
          >
            <TagsInput.Label>Skills</TagsInput.Label>
            <TagsInput.Control>
              {field.value.map((skill: string, index: number) => (
                <TagsInput.Item key={skill} index={index} value={skill}>
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText>{skill}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                  <TagsInput.ItemInput />
                </TagsInput.Item>
              ))}
              <TagsInput.Input placeholder="Add skill..." />
            </TagsInput.Control>
          </TagsInput.Root>
        )}
      />

      <Field.Root readOnly={isReadOnly}>
        <Field.Label textStyle="caption">Description</Field.Label>
        <Textarea {...register('description')} autoresize resize="none" />
      </Field.Root>

      <SortableListInput.Root<FormValues>
        control={control}
        register={register}
        name="requirements"
        readOnly={isReadOnly}
        defaultItem={{ value: '' }}
      >
        <HStack justify="space-between">
          <SortableListInput.Label>Requirements</SortableListInput.Label>
          <SortableListInput.AddButton />
        </HStack>

        <SortableListInput.List>
          <SortableListInput.Item<FormValues>>
            {({ index, name, register, readOnly }) => (
              <>
                <SortableListInput.Marker color="green">
                  <PiCheck />
                </SortableListInput.Marker>
                <Textarea
                  {...register(`${name}.${index}.value`)}
                  placeholder="Enter requirement..."
                  variant="flushed"
                  rows={1}
                  minH="auto"
                  py="xs"
                  css={{ fieldSizing: 'content' }}
                  resize="none"
                  flex="1"
                  readOnly={readOnly}
                />
                <SortableListInput.DeleteButton />
              </>
            )}
          </SortableListInput.Item>
        </SortableListInput.List>
      </SortableListInput.Root>
    </>
  );
}
