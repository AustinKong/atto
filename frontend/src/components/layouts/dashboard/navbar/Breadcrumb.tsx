import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react';
import { Fragment, useMemo } from 'react';
import { Link, useLocation } from 'react-router';

import { toTitleCase } from '@/utils/text';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function Breadcrumb({ separator = '/ ', ...rest }) {
  const { pathname } = useLocation();

  const pathLinks = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    const links = segments.map((segment, index) => {
      const to = '/' + segments.slice(0, index + 1).join('/');
      const label = UUID_REGEX.test(segment) ? segment.slice(0, 8) : toTitleCase(segment);

      return { label, to };
    });

    return [{ label: 'Home', to: '/' }, ...links];
  }, [pathname]);

  return (
    <ChakraBreadcrumb.Root {...rest}>
      <ChakraBreadcrumb.List>
        {pathLinks.map((item, index) => {
          const isLast = index === pathLinks.length - 1;
          return (
            <Fragment key={index}>
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
