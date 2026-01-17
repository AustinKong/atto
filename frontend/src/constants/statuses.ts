import React from 'react';
import {
  PiArrowLeft,
  PiArrowLeftFill,
  PiCheckCircle,
  PiCheckCircleFill,
  PiEye,
  PiEyeFill,
  PiFloppyDisk,
  PiFloppyDiskFill,
  PiGhost,
  PiGhostFill,
  PiHandHeart,
  PiHandHeartFill,
  PiMicrophone,
  PiMicrophoneFill,
  PiPaperPlaneTilt,
  PiPaperPlaneTiltFill,
  PiX,
  PiXCircle,
  PiXCircleFill,
  PiXFill,
} from 'react-icons/pi';

import type { StatusEnum, StatusEvent } from '@/types/application';
import { STATUS_LIST } from '@/types/application';

export const STATUS_DEFINITIONS: Record<
  StatusEnum,
  { label: string; icon: React.ComponentType; iconFill: React.ComponentType; colorPalette: string }
> = {
  saved: {
    label: 'Saved',
    icon: PiFloppyDisk,
    iconFill: PiFloppyDiskFill,
    colorPalette: 'gray',
  },
  applied: {
    label: 'Applied',
    icon: PiPaperPlaneTilt,
    iconFill: PiPaperPlaneTiltFill,
    colorPalette: 'blue',
  },
  screening: { label: 'Screening', icon: PiEye, iconFill: PiEyeFill, colorPalette: 'blue' },
  interview: {
    label: 'Interview',
    icon: PiMicrophone,
    iconFill: PiMicrophoneFill,
    colorPalette: 'blue',
  },
  offer_received: {
    label: 'Offer Received',
    icon: PiHandHeart,
    iconFill: PiHandHeartFill,
    colorPalette: 'green',
  },
  accepted: {
    label: 'Accepted',
    icon: PiCheckCircle,
    iconFill: PiCheckCircleFill,
    colorPalette: 'green',
  },
  rejected: { label: 'Rejected', icon: PiXCircle, iconFill: PiXCircleFill, colorPalette: 'red' },
  ghosted: { label: 'Ghosted', icon: PiGhost, iconFill: PiGhostFill, colorPalette: 'red' },
  withdrawn: {
    label: 'Withdrawn',
    icon: PiArrowLeft,
    iconFill: PiArrowLeftFill,
    colorPalette: 'red',
  },
  rescinded: { label: 'Rescinded', icon: PiX, iconFill: PiXFill, colorPalette: 'red' },
};

export const STATUS_OPTIONS = STATUS_LIST.filter((status) => status !== 'saved') // Exclude 'saved' from user-selectable options in event creation
  .map((status) => ({
    value: status,
    label: STATUS_DEFINITIONS[status].label,
    icon: STATUS_DEFINITIONS[status].icon,
  }));

export const STATUS_FILTER_OPTIONS = STATUS_LIST.map((status) => ({
  value: status,
  label: STATUS_DEFINITIONS[status].label,
  icon: STATUS_DEFINITIONS[status].icon,
}));

export const getStatusText = (statusEvent: StatusEvent): string => {
  const statusDefinition = STATUS_DEFINITIONS[statusEvent.status];
  const statusLabel = statusDefinition.label;

  if ('stage' in statusEvent && typeof statusEvent.stage === 'number' && statusEvent.stage > 0) {
    return `${statusLabel} ${statusEvent.stage}`;
  }

  return statusLabel;
};
