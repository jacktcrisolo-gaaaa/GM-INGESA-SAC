import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { usuarioId, motivo, firma, eppsSeleccionados } = data;

    // Crear la solicitud en la base de datos
    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        motivo,
        firma,
        usuarioId,
        epps: {
          create: eppsSeleccionados.map((item: any) => ({
            eppId: item.eppId,
            cantidad: item.cantidad
          }))
        }
      }
    });

    // Generar correo de prueba (Ethereal Email)
    try {
      let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });

      let info = await transporter.sendMail({
        from: '"Sistema EPP" <notificaciones@sistemaepp.com>',
        to: "lider@empresa.com", // Aqui se pondra tu correo real en produccion
        subject: `Nueva Solicitud de EPP - ${motivo}`,
        html: `
          <h2>Se ha generado un nuevo pedido de EPP</h2>
          <p><b>Motivo:</b> ${motivo}</p>
          <p>Un trabajador ha solicitado equipos. Por favor ingresa al sistema para aprobarlo.</p>
          <a href="http://localhost:3000/admin">Ir al Panel de Control</a>
        `,
      });

      console.log("Correo enviado. URL de vista previa:", nodemailer.getTestMessageUrl(info));
    } catch(e) {
      console.error("Error enviando correo", e);
    }

    return NextResponse.json({ success: true, solicitudId: nuevaSolicitud.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al guardar la solicitud' }, { status: 500 });
  }
}
