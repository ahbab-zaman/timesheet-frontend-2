// hooks/useToast.js
import { toast } from 'react-toastify';

const defaultOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  };

  const showError = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  };

  const showWarning = (message, options = {}) => {
    toast.warn(message, { ...defaultOptions, ...options });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
