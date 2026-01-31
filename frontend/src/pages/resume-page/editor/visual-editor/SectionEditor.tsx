import { HStack, IconButton, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { PiDotsSixVertical, PiTrash } from 'react-icons/pi';

import type { ResumeData } from '@/types/resume';

import { DetailedItemEditor } from './DetailedItemEditor';
import { SimpleBulletEditor } from './SimpleBulletEditor';

interface SectionEditorProps {
  id: string;
  index: number;
  onDelete: () => void;
}

// FIXME: This component (not its children) is extra heavy every rerender. figure out why
function SectionEditorComponent({ id, index, onDelete }: SectionEditorProps) {
  const { register, control } = useFormContext<ResumeData>();
  // Only subscribe to the section type. Watching the entire section object
  // causes this component to re-render for any nested field change (bullets,
  // item text, etc.) which is unnecessary for choosing which editor to show.
  const type = useWatch({ name: `sections.${index}.type`, control }) as string | undefined;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 999 : 0,
    }),
    [transform, transition, isDragging]
  );
  const content = useMemo(() => {
    if (!type) return null;

    if (type === 'paragraph') {
      return (
        <Textarea
          {...register(`sections.${index}.content.text`)}
          placeholder="Enter paragraph text..."
          rows={3}
          variant="flushed"
        />
      );
    }

    if (type === 'detailed') {
      return <DetailedItemEditor sectionIndex={index} control={control} />;
    }

    if (type === 'simple') {
      return <SimpleBulletEditor sectionIndex={index} />;
    }

    return <Text color="fg.muted">Unknown section type</Text>;
  }, [type, control, register, index]);

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

      <VStack p="4" w="full" align="stretch" overflow="visible" pl="8">
        {content}
      </VStack>
    </VStack>
  );
}

export const SectionEditor = memo(SectionEditorComponent);
SectionEditor.displayName = 'SectionEditor';
