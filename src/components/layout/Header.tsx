import { Calendar, User } from 'lucide-react';

export default function Header() {
  const currentDate = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[#0C447C] text-white flex items-center justify-between px-8 sticky top-0 z-10 shadow-lg">
      <div className="flex flex-col">
        <h2 className="text-sm font-bold tracking-tight uppercase opacity-90">PNP DEPDICC IQUITOS</h2>
        <p className="text-[10px] font-medium tracking-[0.2em] opacity-70">SISTEMA DE GESTIÓN DE CARPETAS FISCALES</p>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span className="capitalize">{currentDate}</span>
        </div>
        
        <div className="h-8 w-[1px] bg-white/20"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold leading-tight">ST3 PNP MARCOS CIEZA</p>
            <p className="text-[10px] opacity-70">Efectivo Responsable</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
