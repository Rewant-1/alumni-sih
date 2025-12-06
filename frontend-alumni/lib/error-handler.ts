import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // API error response
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Handle API errors with toast notification
 */
export const handleApiError = (error: unknown): void => {
  const message = getErrorMessage(error);
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });
};

/**
 * Show success toast
 */
export const showSuccess = (message: string): void => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });
};

/**
 * Show loading toast
 */
export const showLoading = (message: string): string => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * Dismiss specific toast
 */
export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};
