import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react';
import { Fragment, useMemo } from 'react';
import { Link, useMatches } from 'react-router';

import { toTitleCase } from '@/utils/text';

type BreadcrumbItem = { label: string; to: string };

// Loader data may either supply a full override list or a single label for that segment.
type BreadcrumbLoaderData = { breadcrumb?: string | [string, string][] };

const HOME_ITEM: BreadcrumbItem = { label: 'Home', to: '/' };

function resolveLabel(
  loaderData: BreadcrumbLoaderData | undefined,
  handle: { breadcrumb?: string } | undefined
): string | undefined {
  if (typeof loaderData?.breadcrumb === 'string') return loaderData.breadcrumb;
  return handle?.breadcrumb;
}

// TODO: Still abit AI-sloppy. To clean up
export function Breadcrumb({
  separator = '/ ',
  ...rest
}: { separator?: string } & ChakraBreadcrumb.RootProps) {
  const matches = useMatches();

  const pathLinks = useMemo((): BreadcrumbItem[] => {
    // If any loader returns a full breadcrumb list, use it as the complete trail.
    for (const m of matches) {
      const loaderData = m.loaderData as BreadcrumbLoaderData | undefined;
      if (Array.isArray(loaderData?.breadcrumb)) {
        return [HOME_ITEM, ...loaderData.breadcrumb.map(([label, to]) => ({ label, to }))];
      }
    }

    // Otherwise, build the trail from each matched route segment.
    const links = matches.reduce<BreadcrumbItem[]>((acc, m) => {
      const to = m.pathname;

      // Skip the root — Home is always prepended at the end.
      if (to === '/') return acc;

      const loaderData = m.loaderData as BreadcrumbLoaderData | undefined;
      const handle = m.handle as { breadcrumb?: string } | undefined;
      const label = resolveLabel(loaderData, handle);

      if (label) {
        acc.push({ label, to });
        return acc;
      }

      // Param routes (e.g. :listingId) without a label are skipped to avoid
      // showing raw IDs in the breadcrumb trail.
      if (Object.keys(m.params ?? {}).length > 0) return acc;

      // For static segments, derive the label from the last path part.
      const lastSegment = to.split('/').filter(Boolean).at(-1);
      if (lastSegment) acc.push({ label: toTitleCase(lastSegment), to });

      return acc;
    }, []);

    return [HOME_ITEM, ...links];
  }, [matches]);

  return (
    <ChakraBreadcrumb.Root {...rest}>
      <ChakraBreadcrumb.List>
        {pathLinks.map((item, index) => {
          const isLast = index === pathLinks.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <ChakraBreadcrumb.Item>
                {isLast ? (
                  <ChakraBreadcrumb.CurrentLink>{item.label}</ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {separator && !isLast && (
                <ChakraBreadcrumb.Separator>{separator}</ChakraBreadcrumb.Separator>
              )}
            </Fragment>
          );
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  );
}
