import { Center, CloseButton, Spinner, Tabs } from '@chakra-ui/react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';

import { useListingQuery } from '@/hooks/listings';

export { Applications } from './applications';
export { Info } from './info';

export function ListingDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId, applicationId } = useParams<{ listingId: string; applicationId?: string }>();
  const { data: listing, isLoading } = useListingQuery(listingId!);

  const activeTab =
    location.pathname.split('/').pop() === listingId
      ? 'info'
      : location.pathname.includes('applications')
        ? 'applications'
        : location.pathname.split('/').pop() || 'info';

  const handleTabChange = (value: string) => {
    const baseUrl = `/listings/${listingId}`;

    const paths: Record<string, string> = {
      info: baseUrl,
      research: `${baseUrl}/research`,
      applications: applicationId
        ? `${baseUrl}/applications/${applicationId}`
        : `${baseUrl}/applications`,
    };

    navigate(paths[value], { replace: true });
  };

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!listing) {
    return (
      <Center h="full">
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
        Listing not found.
      </Center>
    );
  }

  return (
    <Tabs.Root
      h="full"
      display="flex"
      flexDirection="column"
      value={activeTab}
      onValueChange={(e) => handleTabChange(e.value)}
    >
      <Tabs.List borderBottom="none">
        <Tabs.Trigger value="info">Details</Tabs.Trigger>
        <Tabs.Trigger value="applications">Applications</Tabs.Trigger>
        <Tabs.Trigger value="research">Research</Tabs.Trigger>
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
      </Tabs.List>
      <Tabs.Content value={activeTab} flex="1" overflowY="auto">
        <Outlet />
      </Tabs.Content>
    </Tabs.Root>
  );
}
