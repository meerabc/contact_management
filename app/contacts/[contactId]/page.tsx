'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Toast, { useToast } from '@/components/Toast';
import Loader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Contact } from '@/types/contact.types';
import { Task } from '@/types/task.types';

export default function ContactDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params?.contactId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tasksKey, setTasksKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetches contact details
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${contactId}`);
        if (!response.ok) throw new Error('Failed to fetch contact');
        const data = await response.json();
        setContact(data.data);
      } catch (error) {
        console.error('Error fetching contact:', error);
        addToast('Failed to load contact', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [contactId]); 

  // Fetches tasks for contact , refetches when contactId changes or tasksKey changes
  useEffect(() => {
    if (!contactId) return;

    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const response = await fetch(`/api/contacts/${contactId}/tasks?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data.data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [contactId, tasksKey]); 

  const handleTaskCreated = async (newTask: Task) => {
    setShowTaskForm(false);
    setTasksKey(prev => prev + 1);
  };

  const handleTaskToggled = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    // refetches after a short delay to ensure the server state is synced
    setTimeout(() => setTasksKey(prev => prev + 1), 100);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setTimeout(() => setTasksKey(prev => prev + 1), 100);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setTimeout(() => setTasksKey(prev => prev + 1), 100);
  };

  const handleDeleteContact = () => {
    if (!contact) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    fetch(`/api/contacts/${contactId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) {
          addToast('Failed to delete contact', 'error');
        } else {
          addToast('Contact deleted successfully', 'success');
          router.push('/');
        }
      })
      .catch(() => addToast('Delete failed', 'error'))
      .finally(() => setShowDeleteConfirm(false));
  };
  if (!mounted || loading) {
    if (!mounted) {
      return null;
    }
    return (
      <div className="page-loading">
        <Loader size="large" />
      </div>
    );
  }
  if (!contact) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Contact not found</p>
        <Link href="/">← Back to Contacts</Link>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Contact"
        message={`Delete "${contact?.name}" and all associated tasks? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button */}
        <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Contacts
        </Link>

        {/* Contact Header */}
        <div className="contact-header">
          <h1>{contact.name}</h1>
          <div className="contact-info">
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Phone:</strong> {contact.phone}</p>
            <p><strong>Address:</strong> {contact.address}</p>
          </div>
          <div className="contact-actions">
            <Link href={`/contacts/${contactId}/edit`} className="btn-primary">
              Edit Contact
            </Link>
            <button onClick={handleDeleteContact} className="btn-danger">
              Delete Contact
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="tasks-section" style={{ marginTop: '2rem' }}>
          <div className="tasks-header">
            <h2>Tasks ({tasks.length})</h2>
            <button 
              onClick={() => setShowTaskForm(!showTaskForm)} 
              className="btn-secondary"
            >
              {showTaskForm ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <TaskForm
              contactId={contactId}
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowTaskForm(false)}
              onToast={addToast}
              hideCancelButton={true}
            />
          )}

          {tasksLoading ? (
            <Loader />
          ) : tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Create one!</p>
          ) : (
            <TaskList
              tasks={tasks}
              contactId={contactId}
              onTaskToggled={handleTaskToggled}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              onToast={addToast}
            />
          )}
        </div>
      </div>
    </>
  );
}
