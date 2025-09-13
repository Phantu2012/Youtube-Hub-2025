
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircle className="text-green-500" />,
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: <XCircle className="text-red-500" />,
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
  },
  info: {
    icon: <Info className="text-blue-500" />,
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = toastConfig[type];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);
  
  const handleClose = () => {
      setIsVisible(false);
      setTimeout(onClose, 300);
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg ${config.bg} ${config.text} transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {config.icon}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg hover:bg-white/20"
        onClick={handleClose}
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  );
};
   