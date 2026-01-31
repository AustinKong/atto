// DateRangeSelector
// Popover based date range editor that integrates with react-hook-form.

import { Box, Checkbox, HStack, Icon, Popover, Portal, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { type FieldValues, type Path, useFormContext, useWatch } from 'react-hook-form';
import { PiArrowRight } from 'react-icons/pi';

import { ISODateInput, ISOYearMonthInput } from '@/components/custom/DatePickers';
import { DisplayDate } from '@/components/custom/DisplayDate';
import { type ISODate, type ISOYearMonth } from '@/utils/date';

type DateRangeSelectorProps<T extends FieldValues> = {
  startName: Path<T>;
  endName: Path<T>;
  type?: 'date' | 'month';
  size?: 'sm' | 'md';
};

type UnknownRecord = Record<string, unknown>;

export function DateRangeSelector<T extends FieldValues>({
  startName,
  endName,
  type = 'month',
  size = 'sm',
}: DateRangeSelectorProps<T>) {
  const { setValue } = useFormContext<UnknownRecord>();
  const [open, setOpen] = useState(false);

  const start = useWatch({ name: startName }) as string | null | undefined;
  const end = useWatch({ name: endName }) as string | null | undefined;

  const isPresent = end === null;

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(!!e.open)}>
      <Popover.Trigger asChild>
        <Box
          as="button"
          tabIndex={0}
          aria-label="Edit date range"
          borderBottom="1px solid"
          borderBottomColor={open ? 'var(--chakra-colors-gray-focus-ring)' : 'border'}
          outline="none"
          borderBottomWidth="1px"
          boxShadow={open ? '0px 1px 0px 0px var(--chakra-colors-gray-focus-ring)' : undefined}
          // p="2"
          cursor="pointer"
          fontSize="sm"
          // lineHeight="5"
          h="10"
        >
          <HStack gap="2" alignItems="center">
            <DisplayDate date={start} />
            <Icon>
              <PiArrowRight />
            </Icon>

            {isPresent ? (
              <Text as="span" color="fg.muted">
                Present
              </Text>
            ) : (
              <DisplayDate date={end} />
            )}
          </HStack>
        </Box>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content width="auto">
            <Popover.Arrow />
            <Popover.Body>
              <VStack gap="3" align="stretch">
                <Text fontWeight="medium">Enter date</Text>

                <HStack gap="4">
                  <VStack align="stretch" gap="1" flex="1">
                    <Text fontSize="sm">Start Date</Text>
                    <Box>
                      {type === 'date' ? (
                        <ISODateInput
                          size={size}
                          value={(start ?? null) as ISODate | null}
                          onChange={(v: ISODate | null) =>
                            setValue(startName as Path<UnknownRecord>, v ?? null)
                          }
                        />
                      ) : (
                        <ISOYearMonthInput
                          size={size}
                          value={(start ?? null) as ISOYearMonth | null}
                          onChange={(v: ISOYearMonth | null) =>
                            setValue(startName as Path<UnknownRecord>, v ?? null)
                          }
                        />
                      )}
                    </Box>
                  </VStack>

                  <VStack align="stretch" gap="1" flex="1">
                    <HStack justify="space-between">
                      <Text fontSize="sm">End Date</Text>
                      <HStack>
                        <Checkbox.Root
                          size="xs"
                          checked={isPresent}
                          onCheckedChange={(e) =>
                            setValue(endName as Path<UnknownRecord>, e.checked ? null : '')
                          }
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Present</Checkbox.Label>
                        </Checkbox.Root>
                      </HStack>
                    </HStack>

                    <HStack>
                      {type === 'date' ? (
                        <ISODateInput
                          size={size}
                          value={(isPresent ? null : (end ?? null)) as ISODate | null}
                          onChange={(v: ISODate | null) =>
                            setValue(endName as Path<UnknownRecord>, v ?? '')
                          }
                          disabled={isPresent}
                        />
                      ) : (
                        <ISOYearMonthInput
                          size={size}
                          value={(isPresent ? null : (end ?? null)) as ISOYearMonth | null}
                          onChange={(v: ISOYearMonth | null) =>
                            setValue(endName as Path<UnknownRecord>, v ?? '')
                          }
                          disabled={isPresent}
                        />
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
