/**
 * Hook to mark a page or feature as under development.
 *
 * In development mode: Logs a warning to console and allows the page to render.
 * In production mode: Throws an "Unimplemented" error.
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   useDevelopmentOnly('My Feature');
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useDevelopmentOnly(): void {
  const isDev = import.meta.env.MODE === 'development';

  if (!isDev) {
    throw new Response('Not Implemented', { status: 501 });
  }

  if (typeof window !== 'undefined') {
    console.warn(`🚧 Development Feature: Under development.`);
  }
}
