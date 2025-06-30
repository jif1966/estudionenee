// pages/_app.tsx
import '../styles/global.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/contexts/AuthContext'; // 1. Importamos el AuthProvider

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    // 2. AuthProvider envuelve toda la lógica de la aplicación
    <AuthProvider>
      <main className={inter.className}>
        {/* Usamos un ternario para decidir si renderizar el Layout o no */}
        {router.pathname === '/' || router.pathname === '/recuperar-password' ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
        <Toaster />
      </main>
    </AuthProvider>
  );
}