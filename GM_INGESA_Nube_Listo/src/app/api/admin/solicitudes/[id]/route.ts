import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { estado } = await request.json(); 
    const resolvedParams = await params;
    
    const solicitud = await prisma.solicitud.update({
      where: { id: parseInt(resolvedParams.id) },
      data: { estado }
    });
    
    return NextResponse.json(solicitud);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}
