'use client';

import ContactForm from '@/components/ContactForm';
import Toast, { useToast } from '@/components/Toast';

export default function EditContactPage() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ContactForm onToast={addToast} />
    </>
  );
}
