import { baseRoute } from '@/routes';

import { AuthPage } from './index';

export function authRoute() {
  return baseRoute({
    path: 'auth',
    element: <AuthPage />,
  });
}
