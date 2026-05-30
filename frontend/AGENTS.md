# Frontend Agent Guidelines

Stack: React 19, TypeScript (strict), Vite, Chakra UI v3, TanStack Query v5, React Router v7, Zod.

## Formatting

Enforced by Prettier and ESLint — do not bypass:

- 2-space indentation, single quotes, 100-char line width, LF endings.
- Import order (enforced by `eslint-plugin-simple-import-sort`):
  1. `type` imports
  2. External packages
  3. *(blank line)*
  4. Internal `@/` imports
- When importing a service function that conflicts with a local name, alias it with the `Svc` suffix:
  ```ts
  import { createApplication as createApplicationSvc } from '@/services/application.service';
  ```
- If Vite warns that `baseline-browser-mapping` data is stale, refresh it in `frontend/` with:
  `npm i baseline-browser-mapping@latest -D`

## File & directory naming

| What | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `resume-preview/` |
| React component files | `PascalCase` | `ResumePreview.tsx` |
| All other `.ts/.tsx` files | `[entity].[suffix].ts` | `listing.queries.ts` |
| Hook files | `use-[name].hooks.ts` | `use-debounce.hooks.ts` |
| Assets (images, icons) | `kebab-case` | `company-logo.svg` |

Directory naming rules:
- Do **not** add `-page` or `-component` suffixes to directory names — the context is implied by location.
  - ✅ `src/pages/dashboard/`
  - ❌ `src/pages/dashboard-page/`

Suffixes by category:

| Category | Suffix | Plurality |
|---|---|---|
| Types | `.types.ts` | Plural file name |
| Queries | `.queries.ts` | Plural file name |
| Mutations | `.mutations.ts` | Plural file name |
| Loaders | `.loaders.ts` | Plural file name |
| Services | `.service.ts` | **Singular** |
| Utils | `.utils.ts` | Plural file name |
| Hooks | `.hooks.ts` | Plural file name |

## Component structure

Every component lives in a `kebab-case` folder with an `index.tsx` entry point that re-exports the component:

```
components/custom/resume-preview/
├── index.tsx              ← export { ResumePreview } from './ResumePreview'
├── ResumePreview.tsx
└── ResumePreviewCard.tsx
```

Single-file "leaf" components inside `components/ui/` may omit the folder (e.g. `Toaster.tsx`).

## TypeScript rules

- **Never use `any`.**
- Always use `type` over `interface`.
- Inline prop types on the function signature:
  ```ts
  export function Foo({ name }: { name: string }) { ... }
  ```
- Only use `React.memo` when there is a clear performance reason. When used, wrap with a named inner function:
  ```ts
  const Foo = memo(function Foo({ name }: { name: string }) { ... });
  ```
- Named event-handler functions use the `function` keyword unless the handler is short/simple (one expression):
  ```ts
  // preferred for non-trivial handlers
  function handleSubmit() { ... }
  // ok for trivial/short callbacks
  onClick={() => setOpen(false)}
  ```
- Branded types for domain primitives (see `utils/date.utils.ts`):
  ```ts
  export type ISODate = string & { readonly __brand: 'ISODate' };
  ```
- Namespace objects for utilities on branded types:
  ```ts
  export const ISODate = { today, parse, format, ... };
  ```
- Discriminated unions for polymorphic domain types (e.g. `StatusEvent`). Every variant must have a `Literal` discriminant field.
- Enums as `as const` arrays + derived union types:
  ```ts
  export const STATUS_LIST = ['saved', 'applied', ...] as const;
  export type StatusEnum = (typeof STATUS_LIST)[number];
  ```
- Unused variables must be prefixed with `_` to satisfy the `no-unused-vars` rule.
- `noUnusedLocals` and `noUnusedParameters` are enforced — remove dead code rather than commenting it out.

## Services (`src/services/`)

- Pure async functions; no React hooks or context.
- Use the native `fetch` API directly — no axios or wrapping library.
- On a non-OK response, **throw the `Response` object** (`throw response`), not an `Error`.
- Always specify explicit return types: `Promise<Application>`.
- No default exports; use named exports.
- One service file per entity (e.g. `application.service.ts`).

## Queries (`src/queries/`)

- Export a single `[entity]Queries` object (e.g. `applicationQueries`).
- Use `queryOptions()` from TanStack Query for single-item queries.
- Use `infiniteQueryOptions()` for paginated lists.
- Always set `staleTime` on item queries (default `5 * 60 * 1000`).
- Query keys are typed `as const` arrays: `['application', id] as const`.
- Query key shape: `[entity, ...discriminators]`.
- Consume queries in components via `useSuspenseQuery` (single items) or `useInfiniteQuery` (paginated lists).

## Mutations (`src/mutations/`)

- Each mutation is a **named hook function** (not a bare `useMutation` call):
  ```ts
  export function useCreateApplication(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({ ... });
  }
  ```
- Invalidate all affected query keys in `onSuccess`.
- Use `queryClient.setQueryData` for optimistic/immediate cache updates when the server returns the updated entity.
- No default exports; use named exports.

## Route loaders (`src/loaders/`)

- Each loader is a **factory function** that accepts `queryClient` and returns an async loader function:
  ```ts
  export function applicationLoader(queryClient: QueryClient) {
    return async ({ params }: LoaderFunctionArgs) => { ... };
  }
  ```
- Validate params with Zod schemas and the `validateParams` util before use.
- Pre-fetch data via `queryClient.ensureQueryData(...)`.
- Return a plain object `{ entity }`.

## Routing (`src/routes/`, `src/pages/*/route.tsx`)

- The root router is defined in `src/routes/index.tsx` using `createBrowserRouter`.
- Each page exports a `[name]Route(queryClient)` factory function from `route.tsx` that returns a route object using the `baseRoute` helper.
- Nest child routes inside the parent `route.tsx` (e.g. drawer sub-routes).
- Breadcrumb metadata lives on `handle: { breadcrumb: '...' }`.

## Chakra UI

- Use Chakra UI v3 semantic tokens (`fg.muted`, `bg.panel`, etc.) rather than raw CSS values or palette tokens.
- Use `textStyle` values (`xs`–`7xl`, `label`) rather than inline `fontSize`/`fontWeight` props.
- Custom theme tokens and recipes live in `src/components/theme/`.
- Dark mode support via `_dark={{ ... }}` prop variants.
- Prefer spacing tokens (`p="xl"`, `gap="xs"`) over raw pixel/rem values.
- Do not import from `@chakra-ui/react` inside utility files — keep Chakra inside components only.

## Formatters & utils

- Use and extend `src/utils/formatters/` for display formatting. Do not inline formatting logic in components.
- Use `ISODate`, `ISODatetime`, `ISOYearMonth` types and their utility namespaces for all date handling — do not use raw `string` for dates.
- Use `DateFormatPresets` constants rather than ad-hoc `Intl.DateTimeFormatOptions` objects.

## State management

- All server state is managed by TanStack Query.
- Query cache is persisted to IndexedDB via `idb-keyval` (configured in `utils/query-client.utils.ts`).
- Listing drafts use IndexedDB directly.
- Do not use React context or external stores for server state.
