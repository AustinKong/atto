import { createDialogContext } from '@/hooks/useDialogContext';
import type { Application, StatusEvent } from '@/types/application';

export interface StatusEventContextData {
  event?: StatusEvent;
  application: Application;
}

const { Provider, useContextHook, Context } =
  createDialogContext<StatusEventContextData>('StatusEvent');

export const StatusEventProvider = Provider;
export const useStatusEvent = useContextHook;
export const StatusEventContext = Context;
