import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  className?: string;
  classNames?: {
    toast?: string;
    title?: string;
    description?: string;
    loader?: string;
    closeButton?: string;
    cancelButton?: string;
    actionButton?: string;
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
    loading?: string;
    default?: string;
    content?: string;
    icon?: string;
  };
};

const defaultClassNames = {
  toast: 'group rounded-lg border p-4 shadow-lg',
  title: 'font-semibold',
  description: 'text-sm text-muted-foreground',
  actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
  cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/90',
  closeButton: 'text-foreground/50 hover:text-foreground',
};

const getTypeClassNames = (type?: 'success' | 'error' | 'info' | 'warning' | 'loading') => {
  switch (type) {
    case 'success':
      return {
        toast: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100',
        description: 'text-green-800/90 dark:text-green-200/90',
      };
    case 'error':
      return {
        toast: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        description: 'text-red-800/90 dark:text-red-200/90',
      };
    case 'warning':
      return {
        toast: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-100',
        description: 'text-yellow-800/90 dark:text-yellow-200/90',
      };
    case 'info':
      return {
        toast: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100',
        description: 'text-blue-800/90 dark:text-blue-200/90',
      };
    case 'loading':
      return {
        toast: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100',
        description: 'text-gray-800/90 dark:text-gray-200/90',
      };
    default:
      return {
        toast: 'bg-background border-border',
        icon: 'text-foreground',
        title: 'text-foreground',
        description: 'text-muted-foreground',
      };
  }
};

const useSonner = () => {
  const toast = {
    default: (title: string, options?: ToastProps) => {
      return sonnerToast(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames(),
          ...options?.classNames,
        },
      });
    },

    success: (title: string, options?: ToastProps) => {
      return sonnerToast.success(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames('success'),
          ...options?.classNames,
        },
      });
    },

    error: (title: string, options?: ToastProps) => {
      return sonnerToast.error(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames('error'),
          ...options?.classNames,
        },
      });
    },

    warning: (title: string, options?: ToastProps) => {
      return sonnerToast.warning(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames('warning'),
          ...options?.classNames,
        },
      });
    },

    info: (title: string, options?: ToastProps) => {
      return sonnerToast.info(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames('info'),
          ...options?.classNames,
        },
      });
    },

    loading: (title: string, options?: ToastProps) => {
      return sonnerToast.loading(title, {
        ...options,
        classNames: {
          ...defaultClassNames,
          ...getTypeClassNames('loading'),
          ...options?.classNames,
        },
      });
    },

    dismiss: (toastId?: string) => {
      sonnerToast.dismiss(toastId);
    },
  };

  return { toast };
};

export { useSonner };
export type { ToastProps };
