'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TableProperties, 
  PlusCircle, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: TableProperties, label: 'Registro', href: '/registro' },
  { icon: PlusCircle, label: 'Nueva Carpeta', href: '/nuevo' },
];

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Fondo oscuro translúcido (Backdrop) para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-45 md:hidden transition-opacity duration-300 cursor-pointer"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 bg-[#0B0E14] border-r border-[#1E293B] flex flex-col h-screen sticky top-0 transition-transform duration-300 z-50",
        // Comportamiento responsivo: Drawer flotante en móvil, fijo en desktop
        "fixed inset-y-0 left-0 md:relative md:translate-x-0 flex",
        isOpen ? "translate-x-0 shadow-2xl shadow-blue-900/30" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0C447C] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white leading-none tracking-tight">DEPDICC</h1>
            <p className="text-[10px] text-blue-400 font-bold tracking-widest mt-0.5">IQUITOS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                pathname === item.href 
                  ? "bg-[#185FA5] text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-[#151B28] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", pathname === item.href ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
              {pathname === item.href && (
                <div className="absolute right-0 top-0 h-full w-1 bg-white/20"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1E293B]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
            <span className="font-bold text-sm tracking-wide">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
