import { CloseButton, Tabs } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from 'react-router';

import { Info as DetailsTab } from './info';
import { Intelligence as IntelligenceTab } from './intelligence';

export function ListingDrawer() {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();

  return (
    <Tabs.Root defaultValue="details">
      <Tabs.List>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="intelligence">Intelligence</Tabs.Trigger>
        <Tabs.Trigger value="applications" asChild>
          <Link to={`/listings/${listingId}/applications`}>Applications</Link>
        </Tabs.Trigger>
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
      </Tabs.List>
      <Tabs.Content value="details">
        <DetailsTab />
      </Tabs.Content>
      <Tabs.Content value="intelligence">
        <IntelligenceTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}
