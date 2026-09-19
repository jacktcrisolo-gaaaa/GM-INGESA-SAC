"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';

export default function ColaboradorPage() {
  const [user, setUser] = useState<any>(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<any[]>([]);
  const [motivo, setMotivo] = useState('Nuevo Trabajador');
  const [enviando, setEnviando] = useState(false);
  const sigCanvas = useRef<any>({});
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      if(parsed.rol === 'ADMIN') router.push('/admin');
      else setUser(parsed);
    } else {
      router.push('/');
    }
  }, []);

  const buscarEpp = async (q: string) => {
    setBusqueda(q);
    if (q.length >= 2) {
      const res = await fetch(`/api/epps?q=${q}`);
      const data = await res.json();
      setResultados(data);
    } else {
      setResultados([]);
    }
  };

  const agregarEpp = (epp: any) => {
    if (!seleccionados.find(s => s.eppId === epp.id)) {
      setSeleccionados([...seleccionados, { eppId: epp.id, nombre: epp.nombre, cantidad: 1 }]);
    }
    setBusqueda('');
    setResultados([]);
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setSeleccionados(seleccionados.map(s => {
      if(s.eppId === id) return {...s, cantidad: Math.max(1, s.cantidad + delta)};
      return s;
    }));
  }

  const enviarSolicitud = async () => {
    if (seleccionados.length === 0) return alert("Selecciona al menos un EPP");
    if (sigCanvas.current.isEmpty()) return alert("Por favor firma la solicitud antes de enviar.");

    setEnviando(true);
    const firmaData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: user.id,
        motivo,
        firma: firmaData,
        eppsSeleccionados: seleccionados
      })
    });

    if (res.ok) {
      alert("¡Solicitud enviada con éxito! Su líder la revisará pronto.");
      router.push('/');
    } else {
      alert("Hubo un error al enviar la solicitud.");
    }
    setEnviando(false);
  };

  const salir = () => {
    localStorage.removeItem('user');
    router.push('/');
  }

  if(!user) return <p className="p-4 text-black">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black flex justify-center items-start pt-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-t-8 border-[#84C341]">
        
        <div className="flex justify-between items-start mb-6">
          <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain" />
          <button onClick={salir} className="text-sm text-gray-500 hover:text-red-500 font-medium">← Salir</button>
        </div>

        <h1 className="text-3xl font-black mb-1 text-[#002B7F] tracking-tight">Solicitud de EPP</h1>
        <p className="text-gray-600 mb-8 font-medium">Trabajador: <span className="text-black">{user.nombre}</span> (ID: {user.identidad})</p>

        {/* Busqueda */}
        <div className="mb-6 relative">
          <label className="block text-sm font-bold text-[#002B7F] mb-2 uppercase tracking-wide">1. Buscar Equipos</label>
          <input 
            type="text" 
            value={busqueda} 
            onChange={e => buscarEpp(e.target.value)} 
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#84C341] focus:border-transparent transition-all shadow-sm"
            placeholder="Ej: guantes, casco... (escribe 2 letras)"
          />
          {resultados.length > 0 && (
            <div className="absolute w-full bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 z-10 max-h-60 overflow-y-auto">
              {resultados.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => agregarEpp(r)} 
                  className="p-4 hover:bg-[#84C341]/10 cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <p className="font-bold text-gray-800">{r.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista seleccionados */}
        {seleccionados.length > 0 && (
          <div className="mb-8 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h3 className="font-bold mb-3 text-[#002B7F]">Equipos en tu carrito:</h3>
            <div className="space-y-2">
              {seleccionados.map(s => (
                <div key={s.eppId} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <span className="font-semibold text-gray-700">{s.nombre}</span>
                  <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
                    <button onClick={() => cambiarCantidad(s.eppId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 hover:text-red-500 font-bold shadow-sm">-</button>
                    <span className="font-black w-6 text-center text-[#002B7F]">{s.cantidad}</span>
                    <button onClick={() => cambiarCantidad(s.eppId, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 hover:text-[#84C341] font-bold shadow-sm">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivo */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-[#002B7F] mb-2 uppercase tracking-wide">2. Motivo del pedido</label>
          <select 
            value={motivo} 
            onChange={e => setMotivo(e.target.value)} 
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#84C341] focus:border-transparent bg-white shadow-sm font-medium"
          >
            <option>Nuevo Trabajador</option>
            <option>Renovación</option>
            <option>Pérdida de EPP</option>
          </select>
        </div>

        {/* Firma */}
        <div className="mb-10">
          <label className="block text-sm font-bold text-[#002B7F] mb-2 uppercase tracking-wide">3. Firma de Conformidad</label>
          <p className="text-xs text-gray-500 mb-2">Por favor dibuja tu firma con el dedo o el mouse en el recuadro gris.</p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-white transition-colors overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas} 
              canvasProps={{className: 'w-full h-48', style: {touchAction: "none"}}}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button onClick={() => sigCanvas.current.clear()} className="text-sm text-gray-400 hover:text-red-500 font-bold transition-colors">Borrar y firmar de nuevo</button>
          </div>
        </div>

        <button 
          onClick={enviarSolicitud} 
          disabled={enviando}
          className="w-full bg-[#002B7F] text-white p-4 rounded-xl font-black text-lg hover:bg-[#001D56] transition-all shadow-lg disabled:bg-gray-400 transform hover:-translate-y-1"
        >
          {enviando ? 'Enviando...' : 'FIRMADO CONFORME Y ENVIAR PEDIDO'}
        </button>
      </div>
    </div>
  );
}
