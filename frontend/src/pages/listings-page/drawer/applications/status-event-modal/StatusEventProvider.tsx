import { useDialog } from '@chakra-ui/react';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { StatusEventContext, type StatusEventContextData } from './statusEventContext';

export function StatusEventProvider({ children }: { children: ReactNode }) {
  const dialog = useDialog();
  const [context, setContext] = useState<StatusEventContextData | null>(null);

  const open = useCallback(
    (data: StatusEventContextData) => {
      setContext(data);
      dialog.setOpen(true);
    },
    [dialog]
  );

  const close = useCallback(() => {
    dialog.setOpen(false);
    setContext(null);
  }, [dialog]);

  const value = useMemo(
    () => ({
      open,
      close,
      context,
      dialog,
    }),
    [open, close, context, dialog]
  );

  return <StatusEventContext.Provider value={value}>{children}</StatusEventContext.Provider>;
}
