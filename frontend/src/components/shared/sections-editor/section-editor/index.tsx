import { HStack, IconButton, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import type { Control, UseFormRegister } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { PiDotsSixVertical, PiTrash } from 'react-icons/pi';

import type { ResumeData } from '@/types/resume';

import { DetailedItemSection } from './detailed-item-section';
import { SimpleBulletSection } from './simple-bullet-section';

// Must split into two components because useSortable necessarily causes re-renders every drag frame.
export const SectionEditor = memo(function SectionEditor({
  id,
  index,
  onDelete,
}: {
  id: string;
  index: number;
  onDelete: () => void;
}) {
  const { register, control } = useFormContext<ResumeData>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 0,
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      position="relative"
      zIndex={transform ? 1 : 0}
      overflowX="visible"
    >
      <HStack justify="space-between" w="full" p="3" bg="bg.subtle">
        <HStack gap="2" flex="1">
          <HStack
            {...attributes}
            {...listeners}
            cursor="grab"
            color="fg.muted"
            _active={{ cursor: 'grabbing' }}
          >
            <PiDotsSixVertical />
          </HStack>

          <Input
            {...register(`sections.${index}.title`)}
            placeholder="Section Title"
            variant="flushed"
            fontWeight="medium"
            flex="1"
          />
        </HStack>

        <IconButton
          variant="ghost"
          size="xs"
          color="fg.error"
          onClick={onDelete}
          aria-label="Delete section"
        >
          <PiTrash />
        </IconButton>
      </HStack>

      <VStack pr="4" pb="4" w="full" align="stretch" overflow="visible" pl="8">
        <SectionContent sectionIndex={index} control={control} register={register} />
      </VStack>
    </VStack>
  );
});

SectionEditor.displayName = 'SectionEditor';

const SectionContent = memo(function SectionContent({
  sectionIndex,
  control,
  register,
}: {
  sectionIndex: number;
  control: Control<ResumeData>;
  register: UseFormRegister<ResumeData>;
}) {
  const type = useWatch({ name: `sections.${sectionIndex}.type`, control });

  switch (type) {
    case 'paragraph':
      return (
        <Textarea
          {...register(`sections.${sectionIndex}.content.text`)}
          placeholder="Enter paragraph text..."
          rows={3}
          variant="flushed"
        />
      );

    case 'detailed':
      return <DetailedItemSection sectionIndex={sectionIndex} control={control} />;

    case 'simple':
      return <SimpleBulletSection sectionIndex={sectionIndex} />;

    default:
      return <Text color="fg.muted">Unknown section type</Text>;
  }
});

SectionContent.displayName = 'SectionContent';
