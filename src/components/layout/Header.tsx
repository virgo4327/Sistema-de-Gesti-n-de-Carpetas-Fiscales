import { Calendar, User, Menu } from 'lucide-react';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[#0C447C] text-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-lg">
      <div className="flex items-center gap-3">
        {/* Botón Hamburguesa visible solo en móvil */}
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg md:hidden transition-colors cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-xs sm:text-sm font-bold tracking-tight uppercase opacity-90 leading-tight">PNP DEPDICC IQUITOS</h2>
          <p className="text-[8px] sm:text-[10px] font-medium tracking-[0.1em] sm:tracking-[0.2em] opacity-70 leading-none mt-0.5">
            SISTEMA DE GESTIÓN FISCAL
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        {/* Fecha oculta en celulares y tablets para evitar saturar el header */}
        <div className="hidden lg:flex items-center gap-2 text-sm opacity-90">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span className="capitalize">{currentDate}</span>
        </div>
        
        <div className="hidden lg:block h-8 w-[1px] bg-white/20"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] sm:text-xs font-bold leading-tight">ST3 PNP MARCOS CIEZA</p>
            <p className="text-[8px] sm:text-[10px] opacity-70">Responsable</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
