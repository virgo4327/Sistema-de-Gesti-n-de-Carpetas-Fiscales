'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Info,
  Calendar as CalendarIcon,
  User,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const articulosCP = [
  { id: '381', label: 'Art. 381 - Nombramiento, designación, contratación, encargatura o aceptación ilegal de cargo' },
  { id: '382', label: 'Art. 382 – Concusión' },
  { id: '383', label: 'Art. 383 – Cobro indebido' },
  { id: '384', label: 'Art. 384 – Colusión simple y agravada' },
  { id: '385', label: 'Art. 385 – Patrocinio ilegal' },
  { id: '386', label: 'Art. 386 – Responsabilidad de peritos, árbitros y contadores particulares' },
  { id: '387', label: 'Art. 387 – Peculado doloso y culposo' },
  { id: '388', label: 'Art. 388 – Peculado de uso' },
  { id: '389', label: 'Art. 389 – Malversación' },
  { id: '390', label: 'Art. 390 – Retardo injustificado de pago' },
  { id: '391', label: 'Art. 391 – Rehusamiento a entrega de bienes depositados o puestos en custodia' },
  { id: '392', label: 'Art. 392 – Extensión del tipo' },
  { id: '393', label: 'Art. 393 – Cohecho pasivo propio' },
  { id: '393-A', label: 'Art. 393-A – Soborno internacional pasivo' },
  { id: '394', label: 'Art. 394 – Cohecho pasivo impropio' },
  { id: '395', label: 'Art. 395 – Cohecho pasivo específico' },
  { id: '395-A', label: 'Art. 395-A – Cohecho pasivo propio en el ejercicio de la función policial o penitenciaria' },
  { id: '395-B', label: 'Art. 395-B – Cohecho pasivo impropio en el ejercicio de la función policial y penitenciaria' },
  { id: '396', label: 'Art. 396 – Corrupción pasiva de auxiliares jurisdiccionales' },
  { id: '397', label: 'Art. 397 – Cohecho activo genérico' },
  { id: '397-A', label: 'Art. 397-A – Cohecho activo transnacional' },
  { id: '398', label: 'Art. 398 – Cohecho activo específico' },
  { id: '398-A', label: 'Art. 398-A – Cohecho activo en el ámbito de la función policial' },
  { id: '398-B', label: 'Art. 398-B – Inhabilitación' },
  { id: '399', label: 'Art. 399 – Negociación incompatible o aprovechamiento indebido de cargo' },
  { id: '400', label: 'Art. 400 – Tráfico de influencias' },
  { id: '401', label: 'Art. 401 – Enriquecimiento ilícito' },
];

export default function NuevoRegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);
  const [formData, setFormData] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    cf: '',
    investigado: '',
    articulo: '',
    agraviado: '',
    fiscalia: '',
    fiscal: '',
    vencimiento: '',
    estado: 'EN INVESTIGACIÓN',
    info_resolucion: ''
  });
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [checkingCF, setCheckingCF] = useState(false);

  useEffect(() => {
    fetchNextOrderNumber();
  }, []);

  const fetchNextOrderNumber = async () => {
    const { count, error } = await supabase
      .from('carpetas_fiscales')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      setNextOrderNumber((count || 0) + 1);
    }
  };

  const checkDuplicateCF = async (cf: string) => {
    if (!cf || cf.length < 5) {
      setIsDuplicate(false);
      return;
    }
    
    setCheckingCF(true);
    const { data, error } = await supabase
      .from('carpetas_fiscales')
      .select('numero_cf')
      .eq('numero_cf', cf)
      .maybeSingle();
      
    if (!error && data) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
    setCheckingCF(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cf) checkDuplicateCF(formData.cf);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.cf]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('carpetas_fiscales')
        .insert([{
          fecha_ingreso: formData.fecha_ingreso,
          numero_cf: formData.cf,
          investigado: formData.investigado,
          articulo_cp: formData.articulo,
          agraviado: formData.agraviado,
          fiscalia: formData.fiscalia,
          fiscal_responsable: formData.fiscal,
          fecha_vencimiento: formData.vencimiento,
          estado: formData.estado,
          info_resolucion: formData.info_resolucion
        }]);

      if (error) throw error;

      alert('Carpeta registrada exitosamente');
      router.push('/registro');
    } catch (error: any) {
      alert('Error al registrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ingreso de Nueva Carpeta</h1>
          <p className="text-sm text-slate-400 font-medium">Complete los campos obligatorios para registrar la carpeta fiscal.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-10 border-none shadow-2xl">
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Info className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-[0.2em]">Información General</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">N° de Orden</label>
                <div className="px-4 py-3 bg-[#0B0E14] border border-[#1E293B] rounded-lg text-slate-400 font-mono text-sm shadow-inner">
                  {nextOrderNumber.toString().padStart(3, '0')} <span className="text-[10px] text-slate-600 ml-2 uppercase">(Auto)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha de Ingreso *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="date" 
                    required
                    className="input-field pl-10 h-11"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">N° Carpeta Fiscal *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="2406010500-2024-..."
                    required
                    className={cn(
                      "input-field font-mono h-11 transition-all",
                      isDuplicate && "border-red-500 focus:ring-red-500 text-red-400"
                    )}
                    value={formData.cf}
                    onChange={(e) => setFormData({...formData, cf: e.target.value.toUpperCase()})}
                  />
                  {checkingCF && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {isDuplicate && (
                  <p className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                    ESTE NÚMERO DE CARPETA YA ESTÁ REGISTRADO
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Parties Involved */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <User className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-[0.2em]">Sujetos Procesales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investigado(s) *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Nombres completos de los investigados"
                  className="input-field resize-none p-4"
                  value={formData.investigado}
                  onChange={(e) => setFormData({...formData, investigado: e.target.value})}
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agraviado *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Institución o persona agraviada"
                  className="input-field resize-none p-4"
                  value={formData.agraviado}
                  onChange={(e) => setFormData({...formData, agraviado: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Legal & Control */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-[0.2em]">Delito y Control Fiscal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delito / Artículo CP *</label>
                <select 
                  required
                  className="input-field h-11 cursor-pointer"
                  value={formData.articulo}
                  onChange={(e) => setFormData({...formData, articulo: e.target.value})}
                >
                  <option value="">Seleccione un artículo...</option>
                  {articulosCP.map((art) => (
                    <option key={art.id} value={art.label} className="bg-[#151B28]">{art.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiscalía *</label>
                <select 
                  required
                  className="input-field h-11 cursor-pointer"
                  value={formData.fiscalia}
                  onChange={(e) => setFormData({...formData, fiscalia: e.target.value})}
                >
                  <option value="">Seleccione una fiscalía...</option>
                  <option value="FECOF-SUPERIOR-LORETO" className="bg-[#151B28]">FECOF-SUPERIOR-LORETO</option>
                  <option value="FECOF - LORETO" className="bg-[#151B28]">FECOF - LORETO</option>
                  <option value="FECOF - NAUTA" className="bg-[#151B28]">FECOF - NAUTA</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiscal Responsable *</label>
                <input 
                  type="text" 
                  placeholder="Grado y Nombres del Fiscal"
                  required
                  className="input-field h-11"
                  value={formData.fiscal}
                  onChange={(e) => setFormData({...formData, fiscal: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Vencimiento *</label>
                  <input 
                    type="date" 
                    required
                    className="input-field h-11"
                    value={formData.vencimiento}
                    onChange={(e) => setFormData({...formData, vencimiento: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado *</label>
                  <select 
                    required
                    className="input-field h-11 cursor-pointer font-bold"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="EN INVESTIGACIÓN" className="bg-[#151B28]">EN INVESTIGACIÓN</option>
                    <option value="VENCIDO" className="bg-[#151B28] text-red-400">VENCIDO</option>
                    <option value="RESUELTO" className="bg-[#151B28] text-green-400">RESUELTO</option>
                  </select>
                </div>
              </div>
            </div>

            {formData.estado === 'RESUELTO' && (
              <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-400" />
                  <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">Información de Resolución</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Documento de Resolución (N° Oficio / Disposición) *</label>
                  <textarea 
                    rows={2}
                    required={formData.estado === 'RESUELTO'}
                    placeholder="Ej: Oficio N° 123-2024-DIRNIC-PNP / Disposición N° 05-2024"
                    className="input-field bg-[#0B0E14] p-4"
                    value={formData.info_resolucion}
                    onChange={(e) => setFormData({...formData, info_resolucion: e.target.value})}
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6">
          <button 
            type="button" 
            className="px-8 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors uppercase tracking-widest"
            onClick={() => window.history.back()}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || isDuplicate}
            className="px-10 py-3 bg-[#185FA5] text-white rounded-xl hover:bg-[#0C447C] font-black text-sm shadow-xl shadow-blue-900/30 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Registrando...' : 'Registrar Carpeta'}
          </button>
        </div>
      </form>
    </div>
  );
}
