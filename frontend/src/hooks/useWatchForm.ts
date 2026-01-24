import { useEffect, useRef } from 'react';
import { type FieldValues, useFormContext, type UseFormWatch } from 'react-hook-form';

/**
 * Watches for RHF form changes and calls a callback when the form data updates.
 *
 * @template T - The type of the form data, extending FieldValues from react-hook-form
 * @param onChange - Callback function called whenever the form data changes. Receives the complete form data as a parameter.
 * @returns void
 *
 * @example
 * ```tsx
 * useWatchForm({
 *   onChange: (formData) => {
 *     console.log('Form changed:', formData);
 *     // Perform side effects like saving to server
 *   }
 * });
 * ```
 */
export function useWatchForm<T extends FieldValues>(
  onChange: (data: T) => void,
  watch?: UseFormWatch<T>
) {
  const context = useFormContext<T>();
  const watchFn = watch || context.watch;

  const onChangeRef = useRef(onChange);

  // Ensures the onChange below doesn't rerun on every render if consumer defines
  // onChange inline as an arrow function
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const subscription = watchFn((value, { type }) => {
      if (type === 'change') {
        onChangeRef.current(value as T);
      }
    });

    return () => subscription.unsubscribe();
  }, [watchFn]);
}
