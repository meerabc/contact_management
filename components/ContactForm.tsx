'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { parseValidationErrors } from '@/lib/helpers/parseValidationErrors';
import ContactValidator from '@/lib/validators/contact.validator';
import Loader from '@/components/Loader';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Contact extends ContactFormData {
  id: string;
  createdAt: string;
}

interface ContactFormProps {
  onToast?: (message: string, type: 'success' | 'error') => void;
  onClose?: () => void; // for modal mode (form opens in popup form (for creating new contact))
  isModal?: boolean; // checks if form is in modal form
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function ContactForm({ onToast, onClose, isModal = false }: ContactFormProps) {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.contactId as string | undefined;
  const isEditMode = !!contactId;

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');

  // fetches contact if editing
  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${contactId}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response from server');
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch contact');
        }
        const contact = data.data as Contact;
        setFormData({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load contact';
        setGeneralError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId, isEditMode]);

  // clears the field errors when user starts typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FieldErrors];
        return newErrors;
      });
    }
    setGeneralError('');
  };

  // validates the form and submits it
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    const validation = ContactValidator.validateCreateInput(formData);  

    if (!validation.isValid) {
      const errors: FieldErrors = {};
      validation.errors.forEach((err) => {
        errors[err.field as keyof FieldErrors] = err.message;
      });
      setFieldErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/contacts/${contactId}` : '/api/contacts';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setGeneralError('Invalid response from server');
        setSubmitting(false);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        const apiErrors = parseValidationErrors(data.error || '');
        if (Object.keys(apiErrors).length > 0) {
          setFieldErrors(apiErrors as FieldErrors);
        } else {
          setGeneralError(data.error || 'Failed to save contact');
        }
        setSubmitting(false);
        return;
      }

      // toast message on success
      onToast?.(
        isEditMode ? 'Contact updated successfully' : 'Contact created successfully',
        'success'
      );
      // If in modal, close iT. otherwise navigate to the contact page or the home page
      if (isModal && onClose) {
        onClose();
      } else if (isEditMode && contactId) {
        router.push(`/contacts/${contactId}`);
      } else {
      router.push('/');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save contact';
      setGeneralError(errorMsg);
      onToast?.(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className={isModal ? 'form-container-modal' : 'form-container'}>
      {!isModal && <h1>{isEditMode ? 'Edit Contact' : 'Create New Contact'}</h1>}

      {generalError && <div className="error-message-general">{generalError}</div>}

      <form onSubmit={handleSubmit} className="form">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter contact name"
            className={fieldErrors.name ? 'input-error' : ''}
            disabled={submitting}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          />
          {fieldErrors.name && (
            <span id="name-error" className="field-error" role="alert">
              {fieldErrors.name}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={fieldErrors.email ? 'input-error' : ''}
            disabled={submitting}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Phone Field */}
        <div className="form-group">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="555-0001"
            maxLength={8}
            className={fieldErrors.phone ? 'input-error' : ''}
            disabled={submitting}
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
          />
          {fieldErrors.phone && (
            <span id="phone-error" className="field-error" role="alert">
              {fieldErrors.phone}
            </span>
          )}
        </div>

        {/* Address Field */}
        <div className="form-group">
          <label htmlFor="address">
            Address <span className="required">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter full address"
            rows={3}
            className={fieldErrors.address ? 'input-error' : ''}
            disabled={submitting}
            aria-invalid={!!fieldErrors.address}
            aria-describedby={fieldErrors.address ? 'address-error' : undefined}
          />
          {fieldErrors.address && (
            <span id="address-error" className="field-error" role="alert">
              {fieldErrors.address}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEditMode ? 'Update Contact' : 'Create Contact'}
          </button>
          {isModal ? (
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
          ) : isEditMode && contactId ? (
            <Link href={`/contacts/${contactId}`} className="btn-secondary">
              Cancel
            </Link>
          ) : (
            <Link href="/" className="btn-secondary">
              Cancel
          </Link>
          )}
        </div>
      </form>
    </div>
  );
}
