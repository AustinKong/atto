import { createDialogContext } from '@/hooks/use-dialog-context.hooks';
import type { Application, StatusEvent } from '@/types/application.types';

export interface StatusEventContextData {
  event?: StatusEvent;
  application: Application;
}

const { Provider, useContextHook, Context } =
  createDialogContext<StatusEventContextData>('StatusEvent');

export const StatusEventProvider = Provider;
export const useStatusEvent = useContextHook;
export const StatusEventContext = Context;
