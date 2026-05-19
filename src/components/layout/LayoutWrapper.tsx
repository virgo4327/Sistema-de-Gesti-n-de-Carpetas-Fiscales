'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Control de sidebar en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado de notificaciones (Toasts)
  const [toasts, setToasts] = useState<Toast[]>([]);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // 10 minutos = 600,000 ms
    timeoutRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    }, 600000);
  };

  useEffect(() => {
    if (isLoginPage) return;

    // Inicializar el timer
    resetTimer();

    // Eventos que reinician el timer
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isLoginPage]);

  // Manejar el evento personalizado de Toast
  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string; type: 'success' | 'error' | 'warning' }>;
      if (customEvent.detail) {
        const { message, type = 'success' } = customEvent.detail;
        const newToast: Toast = {
          id: Math.random().toString(36).substring(2, 9),
          message,
          type,
        };
        
        setToasts(prev => [...prev, newToast]);
        
        // Eliminar automáticamente a los 3.5 segundos
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 3500);
      }
    };

    window.addEventListener('toast', handleToastEvent);
    return () => window.removeEventListener('toast', handleToastEvent);
  }, []);

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <main className="flex-1 h-screen overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-[#0B0E14] overflow-hidden">
      {/* Sidebar - Pasamos el estado de control responsivo */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Padding responsivo (p-4 en celular, p-8 en desktop) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Contenedor flotante para notificaciones Toast */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full"
            >
              <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl backdrop-blur-md transition-all ${
                toast.type === 'success' 
                  ? 'bg-green-950/90 border-green-500/30 text-green-300 shadow-green-900/10' 
                  : toast.type === 'error'
                  ? 'bg-red-950/90 border-red-500/30 text-red-300 shadow-red-900/10'
                  : 'bg-amber-950/90 border-amber-500/30 text-amber-300 shadow-amber-900/10'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wider">
                    {toast.type === 'success' ? 'Éxito' : toast.type === 'error' ? 'Error' : 'Alerta'}
                  </p>
                  <p className="text-xs font-bold leading-tight mt-1 opacity-90">{toast.message}</p>
                </div>

                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
