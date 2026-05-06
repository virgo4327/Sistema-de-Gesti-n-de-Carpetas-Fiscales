'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      if (error.message.includes('Email not confirmed')) {
        setError('El correo institucional aún no ha sido confirmado en Supabase.');
      } else {
        setError('Credenciales inválidas o usuario no registrado.');
      }
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(12,68,124,0.1),transparent)] pointer-events-none"></div>
      
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-[#0C447C]/20 rounded-3xl border border-[#0C447C]/30 shadow-2xl shadow-blue-900/20">
            <ShieldCheck className="w-12 h-12 text-[#185FA5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">DEPDICC IQUITOS</h1>
            <p className="text-slate-400 font-bold text-sm tracking-widest mt-1">SISTEMA DE GESTIÓN FISCAL</p>
          </div>
        </div>

        <div className="card border-none shadow-2xl bg-[#151B28]/50 backdrop-blur-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@pnp.gob.pe"
                  className="input-field pl-12 h-12 bg-[#0B0E14]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12 h-12 bg-[#0B0E14]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          © 2024 DEPDICC PNP — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
