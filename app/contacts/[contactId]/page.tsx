'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Toast, { useToast } from '@/components/Toast';
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
  const { toasts, addToast, removeToast } = useToast();

  // Fetch contact details
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
  }, [contactId, addToast]);

  // Fetch tasks for this contact
  useEffect(() => {
    if (!contact) return;

    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const response = await fetch(`/api/contacts/${contactId}/tasks`);
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
  }, [contactId]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const handleTaskToggled = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleDeleteContact = () => {
    if (!contact) return;
    
    if (confirm('Delete this contact and all its tasks?')) {
      fetch(`/api/contacts/${contactId}`, { method: 'DELETE' })
        .then((res) => {
          if (!res.ok) {
            addToast('Failed to delete contact', 'error');
          } else {
            addToast('Contact deleted successfully', 'success');
            router.push('/');
          }
        })
        .catch(() => addToast('Delete failed', 'error'));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading...</p>
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
            />
          )}

          {tasksLoading ? (
            <p className="loading">Loading tasks...</p>
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
