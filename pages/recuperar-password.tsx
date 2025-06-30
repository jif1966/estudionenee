// pages/recuperar-password.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Enviando instrucciones...');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });

    setLoading(false);
    toast.dismiss(toastId);

    if (error) {
      toast.error('No se pudo enviar el correo. Inténtalo de nuevo.');
    } else {
      toast.success('¡Correo enviado! Revisa tu bandeja de entrada.');
      setEnviado(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="Logo Estudio Nenee" width={80} height={80} />
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          {enviado ? (
            <div className="text-center">
              <h1 className="text-xl font-bold mb-2 text-gray-800">Revisa tu correo</h1>
              <p className="text-gray-600">
                Se han enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>.
              </p>
              <Link href="/" className="mt-6 block w-full text-center text-sm text-gray-600 hover:underline">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-2 text-center text-gray-800">
                Recuperar Contraseña
              </h1>
              <p className="text-center text-gray-500 mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecerla.
              </p>
              <form onSubmit={handlePasswordReset}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors duration-300 ease-in-out focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-300 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:underline">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}