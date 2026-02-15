import {
  Box,
  Checkbox,
  HStack,
  Icon,
  Popover,
  Portal,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { type Path, useFormContext, useWatch } from 'react-hook-form';
import { PiArrowRight } from 'react-icons/pi';

import { ISOYearMonthInput } from '@/components/custom/DatePickers';
import { DisplayDate } from '@/components/custom/DisplayDate';
import { type ISOYearMonth } from '@/utils/date';

import type { SectionsEditorData } from './types';

export function DateRangeSelector({
  startName,
  endName,
}: {
  startName: Path<SectionsEditorData>;
  endName: Path<SectionsEditorData>;
}) {
  const { setValue } = useFormContext<SectionsEditorData>();
  const { open, onToggle } = useDisclosure();

  const start = useWatch({ name: startName });
  const end = useWatch({ name: endName });

  const isPresent = end === 'present';

  return (
    <Popover.Root open={open} onOpenChange={onToggle}>
      <Popover.Trigger asChild>
        <Box
          as="button"
          tabIndex={0}
          aria-label="Edit date range"
          borderBottom="1px solid"
          borderBottomColor={open ? 'var(--chakra-colors-gray-focus-ring)' : 'border'}
          borderBottomWidth="1px"
          boxShadow={open ? '0px 1px 0px 0px var(--chakra-colors-gray-focus-ring)' : undefined}
          cursor="pointer"
          fontSize="sm"
          h="10"
        >
          <HStack gap="2" alignItems="center">
            <DisplayDate
              date={start}
              options={{ month: 'short', year: 'numeric' }}
              fallback="Start"
              minW="16"
            />
            <Icon>
              <PiArrowRight />
            </Icon>

            {isPresent ? (
              <Text as="span" color="fg.muted" minW="16">
                Present
              </Text>
            ) : (
              <DisplayDate
                date={end}
                options={{ month: 'short', year: 'numeric' }}
                fallback="End"
                minW="16"
              />
            )}
          </HStack>
        </Box>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content width="auto">
            <Popover.Arrow />
            <Popover.Body>
              <HStack gap="4">
                <VStack align="stretch" gap="1" flex="1">
                  <Text fontSize="sm">Start Date</Text>
                  <Box>
                    <ISOYearMonthInput
                      size="sm"
                      value={(start ?? null) as ISOYearMonth | null}
                      onChange={(v: ISOYearMonth | null) => setValue(startName, v ?? null)}
                    />
                  </Box>
                </VStack>

                <VStack align="stretch" gap="1" flex="1">
                  <HStack justify="space-between">
                    <Text fontSize="sm">End Date</Text>
                    <HStack>
                      <Checkbox.Root
                        size="xs"
                        checked={isPresent}
                        onCheckedChange={(e) => setValue(endName, e.checked ? 'present' : null)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>Present</Checkbox.Label>
                      </Checkbox.Root>
                    </HStack>
                  </HStack>

                  <HStack>
                    <ISOYearMonthInput
                      size="sm"
                      value={(isPresent ? null : (end ?? null)) as ISOYearMonth | null}
                      onChange={(v: ISOYearMonth | null) => setValue(endName, v ?? null)}
                      disabled={isPresent}
                    />
                  </HStack>
                </VStack>
              </HStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
