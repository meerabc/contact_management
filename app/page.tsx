'use client';

import ContactList from '@/components/ContactList';
import { Contact } from '@/types/contact.types';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSelectContact = (contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  };

  return (
    <main className="contacts-page">
      <ContactList onSelectContact={handleSelectContact} selectedContact={null} />
    </main>
  );
}
