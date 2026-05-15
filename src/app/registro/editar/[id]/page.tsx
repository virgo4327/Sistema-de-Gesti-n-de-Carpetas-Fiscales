'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Info,
  Calendar as CalendarIcon,
  User,
  ShieldAlert,
  FileCheck,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const articulosCP = [
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

export default function EditarRegistroPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fecha_ingreso: '',
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

  useEffect(() => {
    if (id) fetchCarpeta();
  }, [id]);

  const fetchCarpeta = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('carpetas_fiscales')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setFormData({
        fecha_ingreso: data.fecha_ingreso,
        cf: data.numero_cf,
        investigado: data.investigado,
        articulo: data.articulo_cp,
        agraviado: data.agraviado,
        fiscalia: data.fiscalia,
        fiscal: data.fiscal_responsable,
        vencimiento: data.fecha_vencimiento,
        estado: data.estado,
        info_resolucion: data.info_resolucion || ''
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('carpetas_fiscales')
        .update({
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
        })
        .eq('id', id);

      if (error) throw error;

      alert('Carpeta actualizada exitosamente');
      router.push('/registro');
    } catch (error: any) {
      alert('Error al actualizar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
      Cargando datos de la carpeta...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[#1E293B] rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Editar Carpeta Fiscal</h1>
            <p className="text-sm text-slate-400 font-medium">Actualice la información de la carpeta seleccionada.</p>
          </div>
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
                <input 
                  type="text" 
                  placeholder="2406010500-2024-..."
                  required
                  className="input-field font-mono h-11"
                  value={formData.cf}
                  onChange={(e) => setFormData({...formData, cf: e.target.value})}
                />
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
                <input 
                  type="text" 
                  placeholder="Ej: 1ra Fiscalía Anticorrupción"
                  required
                  className="input-field h-11"
                  value={formData.fiscalia}
                  onChange={(e) => setFormData({...formData, fiscalia: e.target.value})}
                />
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
            onClick={() => router.back()}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-10 py-3 bg-[#185FA5] text-white rounded-xl hover:bg-[#0C447C] font-black text-sm shadow-xl shadow-blue-900/30 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
