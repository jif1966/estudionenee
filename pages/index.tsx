// pages/index.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import React from 'react';

// --- Componentes de Íconos (para replicar el diseño exacto) ---
const EyeIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojo
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Ingresando...');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    toast.dismiss(toastId);
    setLoading(false);

    if (error) {
      toast.error('Email o contraseña incorrectos.');
    } else {
      toast.success('¡Bienvenido!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo Estudio Nenee" width={60} height={60} />
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-center text-gray-900">
            Bienvenido
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Inicia sesión para acceder a tu cuenta.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border-0 border-b-2 border-gray-200 bg-transparent px-0.5 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-0 sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <Link href="/recuperar-password" className="text-sm font-medium text-gray-800 hover:text-gray-600">
                    ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full border-0 border-b-2 border-gray-200 bg-transparent px-0.5 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-0 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-300 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <ArrowRightIcon className="h-4 w-4" />
              <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>¿No tienes una cuenta? <Link href="/registro" className="font-medium text-gray-800 hover:text-gray-600">Regístrate</Link></p>
          <p className="mt-2">© {new Date().getFullYear()} Estudio Nenee. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  );
}