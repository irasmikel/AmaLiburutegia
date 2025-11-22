"use client";

import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationToastProps {
  t: any; // toast object from react-hot-toast
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ t, message, onConfirm, onCancel }) => {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-stone-200`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="h-6 w-6 text-earth-500" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-stone-800">
              Confirmación
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-stone-200">
        <button
          onClick={() => {
            onConfirm();
            toast.dismiss(t.id);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-earth-600 hover:text-earth-700 focus:outline-none focus:ring-2 focus:ring-earth-500"
        >
          <Check size={18} className="mr-1" /> Sí
        </button>
        <button
          onClick={() => {
            onCancel();
            toast.dismiss(t.id);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-stone-600 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500"
        >
          <X size={18} className="mr-1" /> No
        </button>
      </div>
    </div>
  );
};

export default ConfirmationToast;