import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    let epps;
    if (q && q.length >= 2) {
      epps = await prisma.epp.findMany({
        where: { nombre: { contains: q } },
        take: 10
      });
    } else {
      epps = [];
    }
    return NextResponse.json(epps);
  } catch (error) {
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}
