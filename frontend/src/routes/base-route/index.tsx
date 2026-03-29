import { type ComponentType, Suspense } from 'react';
import type { RouteObject as ReactRouterRouteObject } from 'react-router';

import { ErrorElement } from './ErrorElement';
import { Loader } from './Loader';

export type RouteObject = Omit<ReactRouterRouteObject, 'element' | 'errorElement'> & {
  element: ComponentType | React.ReactNode;
  loaderElement?: React.ReactNode;
  errorElement?: React.ReactNode;
};

export function baseRoute(config: RouteObject): ReactRouterRouteObject {
  const { element: Component, loaderElement, errorElement, ...rest } = config;

  return {
    ...rest,
    element: (
      <Suspense fallback={loaderElement || <Loader />}>
        {typeof Component === 'function' ? <Component /> : Component}
      </Suspense>
    ),
    errorElement: errorElement || <ErrorElement />,
  } as ReactRouterRouteObject;
}
