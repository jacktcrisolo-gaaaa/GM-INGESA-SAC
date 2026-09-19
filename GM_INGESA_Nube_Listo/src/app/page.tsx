"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [identidad, setIdentidad] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identidad, contrasena: isAdmin ? contrasena : undefined }),
      });

      if (res.ok) {
        const user = await res.json();
        localStorage.setItem('user', JSON.stringify(user));
        if (user.rol === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/colaborador');
        }
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) {
      setError('Ocurrió un error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-900" 
      style={{ 
        backgroundImage: "linear-gradient(135deg, rgba(0, 43, 127, 0.85) 0%, rgba(100, 112, 125, 0.75) 50%, rgba(132, 195, 65, 0.7) 100%), url('/fondo.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-white/95 p-6 rounded-3xl shadow-xl mb-4 transform hover:scale-105 transition-transform">
          <img src="/logo.png" alt="GM INGESA S.A.C." className="h-36 sm:h-48 w-auto object-contain" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Sistema EPP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-100 font-medium drop-shadow-md">
          Control y registro de entrega de equipos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border-t-4 border-[#84C341]">
          
          {/* Tabs */}
          <div className="flex rounded-lg shadow-sm mb-6 overflow-hidden">
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-sm font-bold border ${
                !isAdmin 
                  ? 'bg-[#002B7F] border-[#002B7F] text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => { setIsAdmin(false); setError(''); }}
            >
              👨‍🔧 Trabajador
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-sm font-bold border-t border-b border-r ${
                isAdmin 
                  ? 'bg-[#84C341] border-[#84C341] text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => { setIsAdmin(true); setError(''); }}
            >
              👔 Líder
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="identidad" className="block text-sm font-semibold text-gray-700">
                {isAdmin ? 'ID de Líder (Administrador)' : 'Número de ID'}
              </label>
              <div className="mt-1">
                <input
                  id="identidad"
                  name="identidad"
                  type="text"
                  required
                  value={identidad}
                  onChange={(e) => setIdentidad(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002B7F] focus:border-[#002B7F] sm:text-sm text-black transition-shadow"
                  placeholder={isAdmin ? "Ingresa tu usuario" : "Ej: 12345678"}
                />
              </div>
            </div>

            {isAdmin && (
              <div>
                <label htmlFor="contrasena" className="block text-sm font-semibold text-gray-700">
                  Contraseña Segura
                </label>
                <div className="mt-1">
                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    required={isAdmin}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002B7F] focus:border-[#002B7F] sm:text-sm text-black transition-shadow"
                    placeholder="••••••"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white ${
                  isAdmin ? 'bg-[#84C341] hover:bg-[#6FA832]' : 'bg-[#002B7F] hover:bg-[#001D56]'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002B7F] transition-all uppercase tracking-wide`}
              >
                {loading ? 'Accediendo...' : 'Ingresar al Sistema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
