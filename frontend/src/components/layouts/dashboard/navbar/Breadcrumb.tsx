import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react';
import { Fragment, useMemo } from 'react';
import { Link, type UIMatch, useMatches } from 'react-router';

type BreadcrumbItem = { label: string; to: string };

const HOME_ITEM: BreadcrumbItem = { label: 'Home', to: '/' };

export function Breadcrumb({
  separator = '/ ',
  ...rest
}: { separator?: string } & ChakraBreadcrumb.RootProps) {
  const matches = useMatches() as UIMatch<
    unknown,
    { breadcrumb?: string | ((data: unknown) => string) }
  >[];

  const pathLinks = useMemo((): BreadcrumbItem[] => {
    const links = matches
      .map((match) => {
        const handle = match.handle?.breadcrumb;
        if (!handle) return null;

        const label = typeof handle === 'function' ? handle(match.loaderData) : handle;

        return { label, to: match.pathname };
      })
      .filter((item): item is BreadcrumbItem => item !== null);

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
