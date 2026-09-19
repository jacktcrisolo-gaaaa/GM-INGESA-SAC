import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const solicitudes = await prisma.solicitud.findMany({
      include: {
        usuario: true,
        epps: {
          include: {
            epp: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
    return NextResponse.json(solicitudes);
  } catch (error) {
    return NextResponse.json({ error: 'Error al cargar solicitudes' }, { status: 500 });
  }
}
