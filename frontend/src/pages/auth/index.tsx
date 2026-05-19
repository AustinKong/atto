import { Navigate } from 'react-router';

import { AuthSplitLayout } from '@/components/layouts/auth-split';
import { useAuth } from '@/hooks/use-auth.hooks';
import { Loader } from '@/routes/base-route/Loader';

import { AuthAside } from './Aside';
import { Form } from './form';

export function AuthPage() {
  const { isLoaded, accessMode } = useAuth();

  if (!isLoaded) {
    return <Loader />;
  }

  if (accessMode !== 'signed_out') {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthSplitLayout aside={<AuthAside />}>
      <Form />
    </AuthSplitLayout>
  );
}
