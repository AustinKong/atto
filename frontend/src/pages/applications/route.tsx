import { baseRoute } from '@/routes';

import { Applications } from './index';

export function applicationsRoute() {
  return baseRoute({
    path: 'applications',
    element: <Applications />,
    handle: { breadcrumb: 'Applications' },
  });
}
