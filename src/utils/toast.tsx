"use client";

import toast from 'react-hot-toast';
import ConfirmationToast from '../components/ConfirmationToast'; // Import the new component

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const showConfirmation = (message: string, onConfirm: () => void, onCancel: () => void) => {
  toast.custom((t) => (
    <ConfirmationToast t={t} message={message} onConfirm={onConfirm} onCancel={onCancel} />
  ), {
    duration: Infinity, // Keep toast visible until user interacts
  });
};