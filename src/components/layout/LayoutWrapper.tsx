'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  if (isLoginPage) {
    return <main className="flex-1 h-screen overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
