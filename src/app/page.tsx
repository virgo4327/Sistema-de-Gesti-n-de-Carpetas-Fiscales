'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Carpetas', value: 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'En Investigación', value: 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: 'Vigentes' },
    { label: 'Vencidos / Críticos', value: 0, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', sub: 'Acción Inmediata' },
    { label: 'Resueltos', value: 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', sub: 'Con Documento' },
  ]);
  const [crimeData, setCrimeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [urgentCases, setUrgentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: carpetas, error } = await supabase
      .from('carpetas_fiscales')
      .select('estado, fecha_vencimiento, articulo_cp, numero_cf, investigado');

    if (!error && carpetas) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Estándar para comparación de fechas

      const total = carpetas.length;
      
      // Lógica corregida: Vencidos son los que tienen estado VENCIDO o cuya fecha ya pasó (y no están resueltos)
      const vencidosCount = carpetas.filter(c => 
        c.estado === 'VENCIDO' || (new Date(c.fecha_vencimiento) < today && c.estado !== 'RESUELTO')
      ).length;

      // Investigación (Vigentes): Solo los que están en investigación y NO han vencido
      const investigacionCount = carpetas.filter(c => 
        c.estado === 'EN INVESTIGACIÓN' && new Date(c.fecha_vencimiento) >= today
      ).length;

      const resueltosCount = carpetas.filter(c => c.estado === 'RESUELTO').length;

      setStats([
        { label: 'Total Carpetas', value: total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'En Investigación', value: investigacionCount, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: 'Vigentes' },
        { label: 'Vencidos / Críticos', value: vencidosCount, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', sub: 'Acción Inmediata' },
        { label: 'Resueltos', value: resueltosCount, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', sub: 'Con Documento' },
      ]);

      // Process crime data
      const crimes = carpetas.reduce((acc: any, curr) => {
        const art = curr.articulo_cp.split(' – ')[0] || curr.articulo_cp;
        acc[art] = (acc[art] || 0) + 1;
        return acc;
      }, {});
      
      const chartData = Object.keys(crimes).map(key => ({ name: key, value: crimes[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCrimeData(chartData);

      // Process status data for percentages
      if (total > 0) {
        setStatusData([
          { name: 'En investigación', value: Math.round((investigacionCount / total) * 100), color: '#3B82F6' },
          { name: 'Vencido', value: Math.round((vencidosCount / total) * 100), color: '#EF4444' },
          { name: 'Resuelto', value: Math.round((resueltosCount / total) * 100), color: '#10B981' },
        ]);
      }

      // Urgent cases (Vencidos)
      const urgent = carpetas
        .filter(c => c.estado === 'VENCIDO' || (new Date(c.fecha_vencimiento) < today && c.estado !== 'RESUELTO'))
        .map(c => {
           const vencimiento = new Date(c.fecha_vencimiento);
           const diff = Math.ceil((vencimiento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
           return { ...c, dias: diff };
        })
        .slice(0, 5);
      setUrgentCases(urgent);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card border-transparent">
              <div className="flex justify-between items-start">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-20 h-3 ml-auto" />
                  <Skeleton className="w-10 h-8 ml-auto" />
                </div>
              </div>
              <Skeleton className="w-24 h-4 mt-4 rounded-full" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card hover:border-[#185FA5]/50 transition-all cursor-default group border-transparent"
            >
              <div className="flex justify-between items-start">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white mt-1 tabular-nums">{stat.value}</h3>
                </div>
              </div>
              {stat.sub && (
                <div className="mt-4 flex items-center gap-1.5">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border", 
                    stat.label.includes('Vencidos') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    stat.label.includes('Investigación') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                  )}>
                    {stat.sub}
                  </span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-white flex items-center gap-2 tracking-tight uppercase">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Incidencia por Delito
            </h3>
          </div>
          <div className="h-[300px] w-full">
            {crimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crimeData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E293B" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} 
                    width={150}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {crimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#1D4ED8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                Sin datos suficientes
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="font-bold text-white mb-8 flex items-center gap-2 tracking-tight uppercase">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Distribución de Estados
          </h3>
          <div className="space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                  <Skeleton className="w-full h-2.5 rounded-full" />
                </div>
              ))
            ) : statusData.length > 0 ? statusData.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">{item.name}</span>
                  <span className="font-black text-white">{item.value}%</span>
                </div>
                <div className="w-full bg-[#0B0E14] h-2.5 rounded-full overflow-hidden border border-[#1E293B]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                    style={{ backgroundColor: item.color }}
                  ></motion.div>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                Esperando datos...
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card"
      >
        <h3 className="font-bold text-white mb-6 flex items-center gap-2 tracking-tight uppercase">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          Alertas Críticas (Vencidos)
        </h3>
        <div className="table-container border-none">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0B0E14] border-b border-[#1E293B]">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">N° Carpeta Fiscal</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Investigado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Vencimiento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {urgentCases.length > 0 ? urgentCases.map((case_item, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors bg-red-500/5">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-red-400">{case_item.numero_cf}</td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-bold">{case_item.investigado}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{case_item.fecha_vencimiento}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-red-500 text-white border-red-600 animate-pulse">
                      VENCIDO
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                    No hay alertas críticas pendientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <div className="p-10 space-y-4">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
