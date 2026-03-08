# Project Naming & Structure Conventions

## 1. Casing Standards

* **PascalCase**: Reserved exclusively for **React Components** (e.g., `UserProfile.tsx`).
* **kebab-case**: Used for **everything else**. This includes:
  * All directories (even those containing components).
  * Non-component files (services, utils, hooks, styles).
  * Assets (images, icons).

## 2. Directory Structure

* **No Suffixes**: Do not add `-page` or `-component` to directory names. The context is implied by the location.
* *Good:* `src/pages/dashboard/`
* *Bad:* `src/pages/dashboard-page/`

## 3. File Naming Pattern: `entity.suffix.ts`

All logic files follow the `[singular-entity].[suffix].ts` pattern.

| Category | Suffix | Plurality | Example |
| --- | --- | --- | --- |
| **Types** | `.types.ts` | Plural | `application.types.ts` |
| **Queries** | `.queries.ts` | Plural | `application.queries.ts` |
| **Mutations** | `.mutations.ts` | Plural | `application.mutations.ts` |
| **Loaders** | `.loaders.ts` | Plural | `application.loaders.ts` |
| **Services** | `.service.ts` | **Singular** | `application.service.ts` |
| **Utils** | `.utils.ts` | Plural | `date.utils.ts` |

## 4. Component Folders

Each component should live in a kebab-case folder with an `index.ts` entry point.

```text
user-profile-card/
├── index.ts (exports UserProfileCard)
└── UserProfileCard.tsx

```