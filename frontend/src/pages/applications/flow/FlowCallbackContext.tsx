import { createContext, useContext } from 'react';

import type { FormValues } from './StatusEventNode';

type FlowCallbacks = {
  onChange: (id: string, values: FormValues) => void;
  onDelete: (id: string) => void;
};

export const FlowCallbackContext = createContext<FlowCallbacks | null>(null);

export function useFlowCallbacks(): FlowCallbacks {
  const ctx = useContext(FlowCallbackContext);
  if (!ctx) throw new Error('useFlowCallbacks must be used within FlowCallbackContext');
  return ctx;
}
