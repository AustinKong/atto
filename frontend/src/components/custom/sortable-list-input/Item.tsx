import { HStack, type StackProps } from '@chakra-ui/react';
import type { ArrayPath, FieldArray, FieldValues } from 'react-hook-form';

import type { SortableListInputContextValue, SortableListInputItemContextValue } from './contexts';
import { useSortableListInput, useSortableListInputItem } from './contexts';

interface ItemFunctionContext<T extends FieldValues>
  extends SortableListInputContextValue<T>,
    SortableListInputItemContextValue {}

interface ItemProps<T extends FieldValues>
  extends Omit<StackProps, 'onMouseEnter' | 'onMouseLeave' | 'children'> {
  children: React.ReactNode | ((context: ItemFunctionContext<T>) => React.ReactNode);
  onMouseEnter?: (item: FieldArray<T, ArrayPath<T>>) => void;
  onMouseLeave?: (item: FieldArray<T, ArrayPath<T>>) => void;
}

export function Item<T extends FieldValues>({
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ItemProps<T>) {
  const listContext = useSortableListInput<T>();
  const itemContext = useSortableListInputItem();

  const currentItem = listContext.fields[itemContext.index] as FieldArray<T, ArrayPath<T>>;

  return (
    <HStack
      w="full"
      alignItems="center"
      onMouseEnter={() => onMouseEnter?.(currentItem)}
      onMouseLeave={() => onMouseLeave?.(currentItem)}
      {...props}
    >
      {typeof children === 'function' ? children({ ...listContext, ...itemContext }) : children}
    </HStack>
  );
}
