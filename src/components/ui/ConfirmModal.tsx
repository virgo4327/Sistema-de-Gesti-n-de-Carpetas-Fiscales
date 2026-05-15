'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#151B28] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-3 rounded-xl",
                    variant === 'danger' ? "bg-red-500/10" : "bg-blue-500/10"
                  )}>
                    <AlertTriangle className={cn(
                      "w-6 h-6",
                      variant === 'danger' ? "text-red-400" : "text-blue-400"
                    )} />
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-1 hover:bg-[#1E293B] rounded-lg transition-colors text-slate-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-5">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-black text-white uppercase tracking-widest shadow-xl transition-all active:scale-95",
                      variant === 'danger' 
                        ? "bg-red-500 hover:bg-red-600 shadow-red-900/20" 
                        : "bg-[#185FA5] hover:bg-[#0C447C] shadow-blue-900/20"
                    )}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
