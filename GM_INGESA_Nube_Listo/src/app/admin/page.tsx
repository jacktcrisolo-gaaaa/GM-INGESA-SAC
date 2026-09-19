"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from "jspdf";

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      const parsed = JSON.parse(u);
      if(parsed.rol !== 'ADMIN') router.push('/');
      else {
        setUser(parsed);
        cargarSolicitudes();
      }
    } else {
      router.push('/');
    }
  }, []);

  const cargarSolicitudes = async () => {
    const res = await fetch('/api/admin/solicitudes');
    const data = await res.json();
    setSolicitudes(data);
  };

  const actualizarEstado = async (id: number, estado: string) => {
    const res = await fetch(`/api/admin/solicitudes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    if (res.ok) {
      cargarSolicitudes();
      if(estado === 'Conforme') {
        alert("Solicitud Aprobada exitosamente.");
      }
    }
  };

  const generarPDF = async (sol: any) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(0, 43, 127); // Azul Corporativo
    doc.text("Certificado de Entrega de EPP", 20, 20);
    
    // Datos Generales
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha del Pedido: ${new Date(sol.fecha).toLocaleDateString()}`, 20, 35);
    doc.text(`Nombre del Trabajador: ${sol.usuario.nombre}`, 20, 45);
    doc.text(`Documento / ID: ${sol.usuario.identidad}`, 20, 55);
    doc.text(`Motivo: ${sol.motivo}`, 20, 65);
    doc.text(`Estado Final: ${sol.estado}`, 20, 75);
    
    // Lista de EPPs
    doc.setFont(undefined, 'bold');
    doc.text("Equipos Entregados:", 20, 90);
    doc.setFont(undefined, 'normal');
    let y = 100;
    sol.epps.forEach((item: any) => {
      doc.text(`- ${item.cantidad} x ${item.epp.nombre}`, 25, y);
      y += 10;
    });

    // Firmas
    doc.setFont(undefined, 'bold');
    doc.text("Firma de Conformidad del Trabajador:", 20, y + 20);
    doc.setFont(undefined, 'normal');
    if(sol.firma) {
      doc.addImage(sol.firma, "PNG", 20, y + 25, 60, 30);
    }

    doc.setFont(undefined, 'bold');
    doc.text("Aprobado por: Administrador Líder", 120, y + 35);
    doc.setFont(undefined, 'normal');
    doc.text("GM INGESA S.A.C", 120, y + 42);
    
    // Descargar
    doc.save(`Certificado_EPP_${sol.usuario.identidad}_${sol.id}.pdf`);
  };

  const salir = () => {
    localStorage.removeItem('user');
    router.push('/');
  }

  if (!user) return <p className="p-4 text-black">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md border-t-8 border-[#002B7F]">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-24 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-black text-[#002B7F] tracking-tight">Panel de Control: Solicitudes EPP</h1>
              <p className="text-sm text-gray-500 font-medium">Líder Activo: {user.nombre}</p>
            </div>
          </div>
          <button onClick={salir} className="bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm">Cerrar Sesión</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#002B7F] text-white text-xs uppercase tracking-widest">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Trabajador</th>
                <th className="p-4 font-semibold">Motivo</th>
                <th className="p-4 font-semibold">EPPs Solicitados</th>
                <th className="p-4 font-semibold">Firma</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {solicitudes.map(sol => (
                <tr key={sol.id} className="hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors">
                  <td className="p-4">{new Date(sol.fecha).toLocaleDateString()} <br/><span className="text-xs text-gray-500">{new Date(sol.fecha).toLocaleTimeString()}</span></td>
                  <td className="p-4 font-bold text-gray-800">{sol.usuario.nombre} <br/><span className="text-xs text-gray-500 font-normal">ID: {sol.usuario.identidad}</span></td>
                  <td className="p-4 text-gray-700">{sol.motivo}</td>
                  <td className="p-4">
                    <ul className="list-none text-gray-700 space-y-1">
                      {sol.epps.map((item: any) => (
                        <li key={item.id} className="bg-gray-50 px-2 py-1 rounded inline-block text-xs border border-gray-200 mb-1 mr-1">
                          <b className="text-[#002B7F]">{item.cantidad}x</b> {item.epp.nombre}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <img src={sol.firma} alt="Firma" className="h-12 w-24 border border-gray-200 rounded bg-white object-contain shadow-sm" />
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                      sol.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                      sol.estado === 'Conforme' ? 'bg-[#84C341]/20 text-[#4c7521] border border-[#84C341]' : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {sol.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {sol.estado === 'Pendiente' && (
                      <div className="flex flex-col gap-2">
                        <button onClick={() => actualizarEstado(sol.id, 'Conforme')} className="bg-[#84C341] text-white px-3 py-2 rounded-lg font-bold hover:bg-[#6FA832] shadow-sm transition-all transform hover:scale-105">✓ Aprobar</button>
                        <button onClick={() => actualizarEstado(sol.id, 'No Conforme')} className="bg-white text-red-500 border border-red-500 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 shadow-sm transition-all">✕ Rechazar</button>
                      </div>
                    )}
                    {sol.estado === 'Conforme' && (
                      <button onClick={() => generarPDF(sol)} className="bg-[#002B7F] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#001D56] shadow-sm w-full transition-all">📄 Descargar PDF</button>
                    )}
                    {sol.estado === 'No Conforme' && (
                      <span className="text-gray-400 italic text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
              {solicitudes.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-gray-500 text-lg font-medium bg-gray-50 rounded-b-xl">No hay solicitudes pendientes. ¡Todo al día!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
