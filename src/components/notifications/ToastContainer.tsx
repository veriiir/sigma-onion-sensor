import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { Notification } from '../../types';

const toastConfig = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    bar: 'bg-teal-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    bar: 'bg-amber-500',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    border: 'border-red-200',
    bg: 'bg-red-50',
    bar: 'bg-red-500',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
};

function Toast({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  const cfg = toastConfig[notif.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 250 }}
      className={`relative w-80 bg-white rounded-2xl shadow-lg border ${cfg.border} overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.bar}`} />
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0 mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { notifications, dismiss } = useNotification();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <Toast notif={n} onDismiss={() => dismiss(n.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
