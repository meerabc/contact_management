'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { Contact } from '@/types/contact.types';
import Modal from '@/components/Modal';
import ContactForm from '@/components/ContactForm';
import Loader from '@/components/Loader';
import Toast, { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ContactListProps {
  onSelectContact?: (contact: Contact) => void;
  selectedContact?: Contact | null;
}

const ITEMS_PER_PAGE = 10;

export default function ContactList({ onSelectContact, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'email' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toasts, addToast, removeToast } = useToast();

  const sortedContacts = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      return [];
    }
    if (!sortBy) {
      return sortDirection === 'asc' ? contacts : [...contacts].reverse();
    }
    return [...contacts].sort((a, b) => {
      if (sortBy === 'name') {
        const compareA = a.name.toLowerCase();
        const compareB = b.name.toLowerCase();
        if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else if (sortBy === 'email') {
        const compareA = a.email.toLowerCase();
        const compareB = b.email.toLowerCase();
        if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [contacts, sortBy, sortDirection]);

  const totalContacts = sortedContacts.length;
  const totalPages = Math.ceil(totalContacts / ITEMS_PER_PAGE);
  const displayedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedContacts.slice(startIndex, endIndex);
  }, [sortedContacts, currentPage]);

  /*
   this useEffect fetches contacts from the api.It is called on mount and when search query 
   changes.Debounced to avoid too many requests while typing and resets to page 1 when search 
   changes
   */
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const fetchContacts = async () => {
      setLoading(true);
      setError('');

      try {
        const url = search 
          ? `/api/contacts?search=${encodeURIComponent(search)}` 
          : `/api/contacts`;
        const response = await fetch(url);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch contacts');
        }
        const data = await response.json();
        if (isMounted) {
          setContacts(data.data || []);
          setCurrentPage(1);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          setContacts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    // initial load - fetch immediately
    // search changes - debounce to avoid too many requests
    if (search === '') {
      fetchContacts();
    } else {
      timer = setTimeout(() => {
        fetchContacts();
      }, 500);
    }
    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [search, refreshKey]);

  /*
   handles delete contact.it shows confirmation dialog, calls DELETE API, refetches list
  */
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/contacts/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      addToast('Contact deleted successfully', 'success');
      setDeleteConfirm(null);
      setRefreshKey(prev => prev + 1);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      addToast(errorMsg, 'error');
      setDeleteConfirm(null);
    }
  };

  // updates currentPage state
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleContactCreated = async () => {
    setShowCreateModal(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Fragment>
      <Toast toasts={toasts} removeToast={removeToast} />
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Contact"
      >
        <ContactForm onToast={addToast} onClose={handleContactCreated} isModal={true} />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Contact"
        message={`Delete contact "${deleteConfirm?.name}"? This will also delete all associated tasks.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
      <div className="contact-list-container">
        {/* HEADER WITH TITLE AND CREATE BUTTON */}
        <div className="list-header">
          <h2>Contacts</h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" type="button">
            + New Contact
          </button>
        </div>

      {/* SEARCH AND SORT CONTROLS */}
      <div className="controls-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <select
            value={sortBy || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSortBy(value === '' ? null : value as 'name' | 'email');
              setCurrentPage(1);
            }}
          >
            <option value="">No Sorting</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>

          <button
            className={`btn-small sort-direction ${sortDirection === 'desc' ? 'active' : ''}`}
            onClick={() => {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            title={`Click to ${sortDirection === 'asc' ? 'reverse' : 'reverse'} order`}
            type="button"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div className="error-message">{error}</div>}

      {/* LOADING STATE */}
      {loading && <Loader />}

      {/* EMPTY STATE, it only shows if not loading and no contacts */}
      {!loading && contacts.length === 0 && !error && (
        <p className="empty-state">
          {search ? 'No contacts found.' : 'No contacts yet. Create your first contact!'}
        </p>
      )}

      {/* CONTACTS LIST */}
      {!loading && contacts.length > 0 && (
        <Fragment>
          <div className="contacts-list">
            {displayedContacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                onClick={() => onSelectContact && onSelectContact(contact)}
              >
                <div className="contact-item-content">
                  <h4>{contact.name}</h4>
                  <p>{contact.email}</p>
                </div>
                {!onSelectContact && (
                  <div className="contact-item-actions">
                    <Link href={`/contacts/${contact.id}/edit`} className="btn-small">
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(contact.id, contact.name);
                      }}
                      className="btn-small btn-danger"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages} ({totalContacts} total)
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-pagination"
              >
                Next →
              </button>
            </div>
          )}
        </Fragment>
      )}
      </div>
    </Fragment>
  );
}
