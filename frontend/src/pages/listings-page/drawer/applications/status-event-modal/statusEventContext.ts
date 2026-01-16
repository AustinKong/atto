import { useDialog } from '@chakra-ui/react';
import { createContext, useContext } from 'react';

import type { Application, StatusEvent } from '@/types/application';

export interface StatusEventContextData {
  event?: StatusEvent;
  application: Application;
}

export interface StatusEventContextValue {
  open: (data: StatusEventContextData) => void;
  close: () => void;
  context: StatusEventContextData | null;
  dialog: ReturnType<typeof useDialog>;
}

export const StatusEventContext = createContext<StatusEventContextValue | null>(null);

export const useStatusEvent = () => {
  const context = useContext(StatusEventContext);
  if (!context) {
    throw new Error('useStatusEvent must be used within a StatusEventProvider');
  }
  return context;
};
