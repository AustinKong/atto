import { Box, Card, HStack, IconButton, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Handle, Position } from '@xyflow/react';
import React, { memo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { PiTrash } from 'react-icons/pi';
import { z } from 'zod';

import { STATUS_DEFINITIONS } from '@/constants/status.constants';
import type {
  StatusEvent,
  StatusEventApplied,
  StatusEventInterview,
} from '@/types/application.types';
import { ISODate, ISODatetime } from '@/utils/date.utils';

import { FormFields } from '../status-event-modal/FormFields';
import { useFlowCallbacks } from './FlowCallbackContext';

const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: z.string().nullable(),
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

function getFormValues(event: StatusEvent): FormValues {
  return {
    status: event.status,
    date: event.date,
    notes: event.notes || '',
    stage: event.status === 'interview' ? (event as StatusEventInterview).stage : 1,
    referrals: event.status === 'applied' ? (event as StatusEventApplied).referrals : [],
    interviewers: event.status === 'interview' ? (event as StatusEventInterview).interviewers : [],
    scheduledAt:
      event.status === 'interview' && (event as StatusEventInterview).scheduledAt
        ? ISODatetime.toLocalInput((event as StatusEventInterview).scheduledAt!)
        : '',
    location: event.status === 'interview' ? (event as StatusEventInterview).location || '' : '',
  };
}

export type StatusEventNodeData = {
  event: StatusEvent;
};

export const StatusEventNode = memo(function StatusEventNode({
  data,
}: {
  data: StatusEventNodeData;
}) {
  const { event } = data;
  const { onChange, onDelete } = useFlowCallbacks();
  const def = STATUS_DEFINITIONS[event.status];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(statusEventSchema),
    mode: 'onChange',
    defaultValues: getFormValues(event),
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    const subscription = watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(event.id, values as FormValues);
      }, 300);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, onChange, event.id]);

  return (
    <Box style={{ width: 280 }}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ zIndex: 10, width: 12, height: 12 }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ zIndex: 10, width: 12, height: 12 }}
      />
      <Card.Root size="sm" overflow="hidden">
        <Card.Header bg="colorPalette.subtle" colorPalette={def.colorPalette} py="xs" px="sm">
          <HStack justify="space-between">
            <HStack gap="xs">
              {React.createElement(def.iconFill as React.ComponentType<{ size?: number }>, {
                size: 14,
              })}
              <Text fontWeight="semibold" textStyle="sm">
                {def.label}
              </Text>
            </HStack>
            <IconButton
              aria-label="Delete node"
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={() => onDelete(event.id)}
              className="nodrag"
            >
              <PiTrash />
            </IconButton>
          </HStack>
        </Card.Header>
        <Card.Body py="sm" px="sm" className="nodrag nopan">
          <FormFields
            control={control}
            register={register}
            selectedStatus={selectedStatus}
            errors={errors}
          />
        </Card.Body>
      </Card.Root>
    </Box>
  );
});
