/**
 * ContactList Component with Pagination
 *
 * LOGIC:
 * - useState(contacts) - stores ALL fetched contacts (unfiltered)
 * - useState(search) - stores search query
 * - useState(currentPage) - tracks current page number
 * - useEffect - fetches contacts when search changes, resets to page 1
 * - Pagination: ITEMS_PER_PAGE = 10 contacts per page
 * - displayedContacts - slice of contacts for current page
 * - totalPages - calculated from total contacts / ITEMS_PER_PAGE
 *
 * Props:
 * - onSelectContact?: callback when contact is clicked (optional)
 * - selectedContact?: currently selected contact for highlighting (optional)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Contact } from '@/types/contact.types';

interface ContactListProps {
  onSelectContact?: (contact: Contact) => void;
  selectedContact?: Contact | null;
}

const ITEMS_PER_PAGE = 10;

export default function ContactList({ onSelectContact, selectedContact }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); // Start with true to show loading initially
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate pagination values with sorting applied - memoized for performance
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      let compareA: any;
      let compareB: any;

      if (sortBy === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else if (sortBy === 'email') {
        compareA = a.email.toLowerCase();
        compareB = b.email.toLowerCase();
      } else if (sortBy === 'createdAt') {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
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

  /**
   * FETCH CONTACTS FROM API
   * Called on mount and when search query changes
   * Debounced to avoid too many requests while typing
   * Resets to page 1 when search changes
   */
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const fetchContacts = async () => {
      setLoading(true);
      setError('');
      setCurrentPage(1); // Reset to page 1 on new search

      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await fetch(`/api/contacts${query}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch contacts');
        }

        const data = await response.json();
        if (isMounted) {
          setContacts(data.data || []);
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

    // Initial load - fetch immediately
    // Search changes - debounce to avoid too many requests
    if (search === '') {
      fetchContacts();
    } else {
      timer = setTimeout(() => {
        fetchContacts();
      }, 500);
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [search]);

  /**
   * HANDLE DELETE CONTACT
   * Shows confirmation, calls DELETE API, refetches list
   */
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete contact "${name}"? This will also delete all associated tasks.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Refetch contacts after delete
      setSearch('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      alert(errorMsg);
    }
  };

  /**
   * HANDLE PAGE CHANGE
   * Validates page number and updates currentPage state
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="contact-list-container">
      {/* HEADER WITH TITLE AND CREATE BUTTON */}
      <div className="list-header">
        <h2>Contacts</h2>
        <Link href="/contacts/new" className="btn-primary">
          + New Contact
        </Link>
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <button
            className={`btn-small sort-direction ${sortDirection === 'desc' ? 'active' : ''}`}
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={`Click to sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && <div className="error-message">{error}</div>}

      {/* LOADING STATE */}
      {loading && <p className="loading">Loading contacts...</p>}

      {/* EMPTY STATE - Only show if not loading and no contacts */}
      {!loading && contacts.length === 0 && !error && (
        <p className="empty-state">
          {search ? 'No contacts found.' : 'No contacts yet. Create your first contact!'}
        </p>
      )}

      {/* CONTACTS LIST */}
      {!loading && contacts.length > 0 && (
        <>
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
                        e.preventDefault();
                        handleDelete(contact.id, contact.name);
                      }}
                      className="btn-small btn-danger"
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
        </>
      )}
    </div>
  );
}
