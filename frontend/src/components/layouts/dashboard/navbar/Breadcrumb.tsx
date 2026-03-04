import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react';
import { Fragment, useMemo } from 'react';
import { Link, useMatches } from 'react-router';

import { toTitleCase } from '@/utils/text';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BreadcrumbItem = { label: string; to: string };

// TODO: Clean this vibe coded slop up
export function Breadcrumb({ separator = '/ ', ...rest }) {
  const matches = useMatches();

  const pathLinks = useMemo(() => {
    // Check if any match has a breadcrumb array (takes precedence)
    for (const m of matches) {
      const loaderData = m.loaderData as { breadcrumb?: string | [string, string][] } | undefined;
      if (Array.isArray(loaderData?.breadcrumb)) {
        return [
          { label: 'Home', to: '/' },
          ...loaderData.breadcrumb.map(([label, to]) => ({ label, to })),
        ];
      }
    }

    // Fall back to normal breadcrumb logic
    const seen = new Set<string>();
    const links: Array<BreadcrumbItem> = [];

    console.log(matches);

    for (const m of matches) {
      const to = m.pathname || '/';

      // Skip if we've already added this pathname
      if (seen.has(to)) continue;
      seen.add(to);

      // Skip root '/' - we'll add Home manually at the start
      if (to === '/') continue;

      // Prefer loader-provided breadcrumb label, then route handle
      const loaderData = m.loaderData as { breadcrumb?: string | [string, string][] } | undefined;
      const handle = m.handle as { breadcrumb?: string } | undefined;
      const labelFromLoader =
        typeof loaderData?.breadcrumb === 'string' ? loaderData.breadcrumb : handle?.breadcrumb;
      if (labelFromLoader) {
        links.push({ label: labelFromLoader, to });
        continue;
      }

      // If the route has a param (e.g. :listingId), skip unless it has a meaningful label
      const paramKeys = Object.keys(m.params || {});
      if (paramKeys.length) {
        // Skip param routes that don't have a loader-provided label
        // (we want to avoid showing UUID segments)
        continue;
      }

      // For non-param routes, use the last pathname segment title-cased
      const parts = to.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && !UUID_REGEX.test(last)) {
        links.push({ label: toTitleCase(last), to });
      }
    }

    // Always start with Home
    return [{ label: 'Home', to: '/' }, ...links];
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
