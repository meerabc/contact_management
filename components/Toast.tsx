'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Toast Component - Display temporary notifications
 *
 * LOGIC:
 * - useState(toasts) - stores array of active toast messages
 * - addToast() - adds new toast with auto-dismiss after duration
 * - removeToast() - removes toast by id
 * - useEffect - auto-dismiss toast after duration
 *
 * Usage from parent:
 * const toastRef = useRef<ToastHandle>(null);
 * toastRef.current?.addToast('Success!', 'success');
 */

export interface ToastHandle {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}

let toastId = 0;

interface ToastComponentProps {
  onAddToast?: (callback: (msg: string, type: ToastType, duration?: number) => void) => void;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clear = () => {
    setToasts([]);
  };

  return { toasts, addToast, removeToast, clear };
};

export default function Toast({
  toasts,
  removeToast,
}: {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
