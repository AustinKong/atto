import { Textarea } from '@chakra-ui/react';
import { useState } from 'react';

import { useUpdateListingNotes } from '@/mutations/listing.mutations';

import { Section } from '../Section';

export function Notes({ listingId, initialNotes }: { listingId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const updateNotes = useUpdateListingNotes();

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateNotes({ listingId, notes: newNotes || null });
  }

  return (
    <Section title="Your Notes">
      <Textarea
        value={notes}
        onChange={handleChange}
        placeholder="Add your research notes about this opportunity here..."
        autoresize
        rows={5}
      />
    </Section>
  );
}
