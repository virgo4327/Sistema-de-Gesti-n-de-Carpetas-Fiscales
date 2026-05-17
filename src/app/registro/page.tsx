'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  FileEdit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegistroPage() {
  const router = useRouter();
  const [carpetas, setCarpetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', numero: '' });

  useEffect(() => {
    fetchCarpetas();
  }, []);

  const fetchCarpetas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('carpetas_fiscales')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const today = new Date();
      const processed = data.map((c, index) => {
        const vencimiento = new Date(c.fecha_vencimiento);
        const diff = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...c, dias: diff, correlativo: data.length - index };
      });
      setCarpetas(processed);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const { id, numero } = deleteModal;
    
    const { error } = await supabase
      .from('carpetas_fiscales')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setCarpetas(carpetas.filter(c => c.id !== id));
    }
  };

  const exportToPDF = (filter: string) => {
    // Filtrar directamente desde carpetas con el parámetro recibido (sin depender de estado async)
    const dataToExport = carpetas.filter(c => {
      if (filter === 'ALL') return true;
      if (filter === 'VENCIDO') {
        return c.estado === 'VENCIDO' || (c.dias <= 0 && c.estado !== 'RESUELTO');
      }
      return c.estado === filter;
    });

    if (dataToExport.length === 0) {
      alert('No hay registros para exportar con este filtro.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });

    // Cabecera institucional
    doc.setFontSize(18);
    doc.setTextColor(12, 68, 124);
    doc.text('PNP DEPDICC IQUITOS', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('SISTEMA DE GESTIÓN DE CARPETAS FISCALES - REPORTE DE CONTROL', 14, 28);

    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')}`, 14, 35);
    doc.text(`Filtro aplicado: ${filter === 'ALL' ? 'TODOS LOS ESTADOS' : filter}`, 14, 41);
    doc.text(`Total de registros: ${dataToExport.length}`, 14, 47);

    const tableData = dataToExport.map(c => [
      c.fecha_ingreso,
      c.numero_cf,
      c.investigado,
      c.articulo_cp,
      c.agraviado,
      `${c.fiscalia}\n(Resp: ${c.fiscal_responsable ?? 'Sin Resp.'})`,
      c.fecha_vencimiento,
      c.estado === 'RESUELTO'
        ? `RESUELTO\n(${c.info_resolucion ?? 'S/D'})`
        : c.estado
    ]);

    autoTable(doc, {
      startY: 53,
      head: [['Ingreso', 'N° Carpeta Fiscal', 'Investigado', 'Delito / Art. CP', 'Agraviado', 'Fiscalía / Responsable', 'Vencimiento', 'Estado / Resolución']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [12, 68, 124], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      columnStyles: { 7: { cellWidth: 45 } },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    const fileName = `Reporte_DEPDICC_${filter === 'ALL' ? 'TODOS' : filter.replace(/ /g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = (filter: string) => {
    const dataToExport = carpetas.filter(c => {
      if (filter === 'ALL') return true;
      if (filter === 'VENCIDO') {
        return c.estado === 'VENCIDO' || (c.dias <= 0 && c.estado !== 'RESUELTO');
      }
      return c.estado === filter;
    });

    if (dataToExport.length === 0) {
      alert('No hay registros para exportar.');
      return;
    }

    const worksheetData = dataToExport.map(c => ({
      'FECHA INGRESO': c.fecha_ingreso,
      'N° CARPETA FISCAL': c.numero_cf,
      'INVESTIGADO': c.investigado,
      'DELITO / ARTÍCULO': c.articulo_cp,
      'AGRAVIADO': c.agraviado,
      'FISCALÍA': c.fiscalia,
      'FISCAL RESPONSABLE': c.fiscal_responsable,
      'VENCIMIENTO': c.fecha_vencimiento,
      'ESTADO': c.estado,
      'INFO RESOLUCIÓN': c.info_resolucion || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Configurar anchos de columna para que se vea ordenado
    const wscols = [
      { wch: 15 }, // FECHA INGRESO
      { wch: 20 }, // N° CARPETA FISCAL
      { wch: 35 }, // INVESTIGADO
      { wch: 45 }, // DELITO / ARTÍCULO
      { wch: 35 }, // AGRAVIADO
      { wch: 25 }, // FISCALÍA
      { wch: 30 }, // FISCAL RESPONSABLE
      { wch: 15 }, // VENCIMIENTO
      { wch: 18 }, // ESTADO
      { wch: 50 }  // INFO RESOLUCIÓN
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Carpetas Fiscales');

    const fileName = `Reporte_DEPDICC_${filter === 'ALL' ? 'TODOS' : filter.replace(/ /g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getSemaforoClass = (dias: number, estado: string) => {
    if (estado === 'RESUELTO') return "bg-green-500/20 text-green-400 border-green-500/30";
    if (estado === 'VENCIDO' || dias <= 0) return "bg-red-500 text-white border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    if (dias <= 7) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (dias <= 20) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-green-500/10 text-green-400 border-green-500/20";
  };

  const getRowClass = (dias: number, estado: string) => {
    if (estado === 'RESUELTO') return "bg-green-500/5 hover:bg-green-500/10";
    if (estado === 'VENCIDO' || dias <= 0) return "bg-red-500/10 hover:bg-red-500/20";
    return "hover:bg-white/[0.02]";
  };

  const filteredCarpetas = carpetas.filter(c => {
    const matchesSearch =
      c.numero_cf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.investigado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fiscal_responsable.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'VENCIDO') {
      matchesStatus = c.estado === 'VENCIDO' || (c.dias <= 0 && c.estado !== 'RESUELTO');
    } else {
      matchesStatus = c.estado === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Registro de Carpetas</h1>
          <p className="text-sm text-slate-400 font-medium">Gestión simplificada: Investigación / Vencido / Resuelto</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <FileText className="w-4 h-4" />
            Exportar Reportes
          </button>

          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-72 bg-[#151B28] border border-[#1E293B] rounded-xl shadow-2xl z-20 p-2 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-4">
                <div>
                  <p className="px-3 py-2 text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-[#1E293B]">Exportar a PDF</p>
                  <div className="py-1">
                    <button
                      onClick={() => { exportToPDF('ALL'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Todos los Estados (PDF)
                    </button>
                    <button
                      onClick={() => { exportToPDF('EN INVESTIGACIÓN'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      Solo En Investigación (PDF)
                    </button>
                    <button
                      onClick={() => { exportToPDF('VENCIDO'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Solo Vencidos (PDF)
                    </button>
                    <button
                      onClick={() => { exportToPDF('RESUELTO'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Solo Resueltos (PDF)
                    </button>
                  </div>
                </div>

                <div>
                  <p className="px-3 py-2 text-[10px] font-black text-green-400 uppercase tracking-widest border-b border-[#1E293B]">Exportar a Excel (.xlsx)</p>
                  <div className="py-1">
                    <button
                      onClick={() => { exportToExcel('ALL'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />
                      Reporte Completo Excel
                    </button>
                    <button
                      onClick={() => { exportToExcel('EN INVESTIGACIÓN'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      Solo En Investigación (Excel)
                    </button>
                    <button
                      onClick={() => { exportToExcel('VENCIDO'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      Solo Vencidos (Excel)
                    </button>
                    <button
                      onClick={() => { exportToExcel('RESUELTO'); setShowExportOptions(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-[#1E293B] hover:text-white rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Solo Resueltos (Excel)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por N° CF, Investigado o Fiscal..." 
              className="input-field pl-10 h-11 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="input-field py-2 text-xs font-bold uppercase tracking-wider w-56 h-11 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="EN INVESTIGACIÓN">EN INVESTIGACIÓN</option>
              <option value="VENCIDO">VENCIDOS</option>
              <option value="RESUELTO">RESUELTO</option>
            </select>
            <button
              className="h-11 px-3 border border-[#1E293B] rounded-md hover:bg-[#1E293B] text-slate-400 transition-colors"
              onClick={() => setStatusFilter('ALL')}
              title="Limpiar filtro"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="table-container border-none bg-transparent overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="bg-[#0B0E14] border-y border-[#1E293B]">
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">N° Ord.</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">F. Ingreso</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Carpeta Fiscal</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Investigado</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Delito / Art.</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Agraviado</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fiscalía / Responsable</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Vencimiento</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Estado Actual</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Alerta</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4"><Skeleton className="w-8 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-20 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-32 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-40 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-24 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-24 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-32 h-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-20 h-4" /></td>
                      <td className="px-4 py-4 text-center"><Skeleton className="w-24 h-6 mx-auto" /></td>
                      <td className="px-4 py-4 text-center"><Skeleton className="w-16 h-10 mx-auto" /></td>
                      <td className="px-4 py-4"><Skeleton className="w-16 h-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredCarpetas.map((carpeta, idx) => (
                  <motion.tr 
                    key={carpeta.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn("transition-colors group", getRowClass(carpeta.dias, carpeta.estado))}
                  >
                    <td className="px-4 py-4 text-[11px] font-bold text-slate-600">{carpeta.correlativo.toString().padStart(3, '0')}</td>
                    <td className="px-4 py-4 text-[11px] text-slate-400 font-medium">{carpeta.fecha_ingreso}</td>
                    <td className="px-4 py-4 text-xs font-mono font-bold text-blue-400">{carpeta.numero_cf}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-200">{carpeta.investigado}</td>
                    <td className="px-4 py-4 text-[10px] text-slate-400 leading-relaxed max-w-[150px] font-medium">{carpeta.articulo_cp}</td>
                    <td className="px-4 py-4 text-[11px] text-slate-400">{carpeta.agraviado}</td>
                    <td className="px-4 py-4">
                      <div className="text-[11px] font-bold text-slate-300">{carpeta.fiscalia}</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">{carpeta.fiscal_responsable}</div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-300">{carpeta.fecha_vencimiento}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "text-[9px] font-black px-3 py-1 rounded shadow-sm uppercase tracking-tighter border",
                          carpeta.estado === 'VENCIDO' ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                          carpeta.estado === 'RESUELTO' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        )}>
                          {carpeta.estado}
                        </span>
                        {carpeta.estado === 'RESUELTO' && (
                          <span className="text-[8px] text-green-500/70 font-bold truncate max-w-[90px]" title={carpeta.info_resolucion}>
                            DOC: {carpeta.info_resolucion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={cn(
                        "inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-lg border min-w-[75px] shadow-lg transition-all",
                        getSemaforoClass(carpeta.dias, carpeta.estado)
                      )}>
                        {carpeta.estado === 'RESUELTO' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : carpeta.estado === 'VENCIDO' || carpeta.dias <= 0 ? (
                          <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                          <>
                            <span className="text-sm font-black leading-none">{carpeta.dias}</span>
                            <span className="text-[8px] font-black uppercase tracking-tighter mt-1">DÍAS</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => router.push(`/registro/editar/${carpeta.id}`)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" 
                          title="Editar"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: carpeta.id, numero: carpeta.numero_cf })}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        <div className="flex items-center justify-between pt-6 border-t border-[#1E293B]">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            {filteredCarpetas.length} registros encontrados
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-600 hover:text-white disabled:opacity-20" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mx-2">
              <button className="w-9 h-9 flex items-center justify-center text-xs font-black bg-[#185FA5] text-white rounded-lg shadow-lg shadow-blue-900/20">1</button>
            </div>
            <button className="p-2 text-slate-600 hover:text-white" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="¿Eliminar Carpeta Fiscal?"
        message={`¿Está seguro que desea eliminar la carpeta ${deleteModal.numero}? Esta acción es permanente y no se podrá deshacer.`}
        confirmText="Eliminar Ahora"
      />
    </div>
  );
}
