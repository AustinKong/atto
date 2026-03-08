import { useDialog } from '@chakra-ui/react';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Generic hook for creating a dialog context with open/close functionality
 * and optional context data.
 *
 * @param name - Name of the context for error messages (e.g., 'Ingestion', 'StatusEvent')
 *
 * @example
 * // Create context
 * const { Provider, useContextHook } = createDialogContext<MyDataType>('MyDialog');
 *
 * // Use in provider
 * <Provider>{children}</Provider>
 *
 * // Use in component
 * const { open, close, context, dialog } = useContextHook();
 */
export function createDialogContext<TContext = null>(name: string) {
  interface DialogContextValue {
    open: (data?: TContext) => void;
    close: () => void;
    context: TContext | null;
    dialog: ReturnType<typeof useDialog>;
  }

  const Context = createContext<DialogContextValue | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const dialog = useDialog();
    const [context, setContext] = useState<TContext | null>(null);

    const open = useCallback(
      (data?: TContext) => {
        setContext(data ?? null);
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

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContextHook() {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  }

  return { Provider, useContextHook, Context };
}
