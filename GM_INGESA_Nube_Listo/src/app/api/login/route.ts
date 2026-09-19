import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { identidad, contrasena } = await request.json();

    const usuario = await prisma.usuario.findUnique({
      where: { identidad },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado. Verifique el ID.' }, { status: 404 });
    }

    if (usuario.rol === 'ADMIN') {
      if (usuario.contrasena !== contrasena) {
        return NextResponse.json({ error: 'Contraseña incorrecta para el administrador.' }, { status: 401 });
      }
    }

    return NextResponse.json({
      id: usuario.id,
      identidad: usuario.identidad,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno en el servidor.' }, { status: 500 });
  }
}
