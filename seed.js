const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crear Admin de prueba
  await prisma.usuario.upsert({
    where: { identidad: 'admin' },
    update: {},
    create: {
      identidad: 'admin',
      nombre: 'Lider de Proyecto',
      rol: 'ADMIN',
      contrasena: '123456', // Contrasena facil de prueba
    },
  });

  // Crear Colaborador de prueba
  await prisma.usuario.upsert({
    where: { identidad: '12345678' },
    update: {},
    create: {
      identidad: '12345678',
      nombre: 'Juan Perez',
      rol: 'COLABORADOR',
    },
  });

  // Limpiar EPPs para evitar duplicados en multiples ejecuciones
  await prisma.epp.deleteMany({});

  // Crear Catalogo EPPs
  const epps = [
    { nombre: 'Guantes de cuero', descripcion: 'Trabajo pesado' },
    { nombre: 'Guantes de nitrilo', descripcion: 'Quimicos' },
    { nombre: 'Casco de seguridad amarillo', descripcion: 'Impactos' },
    { nombre: 'Casco de seguridad blanco', descripcion: 'Ingenieros' },
    { nombre: 'Lentes de proteccion', descripcion: 'Antiesquirlas transparentes' },
    { nombre: 'Lentes oscuros', descripcion: 'Antiesquirlas con filtro UV' },
    { nombre: 'Botas punta de acero', descripcion: 'Calzado de seguridad' },
    { nombre: 'Chaleco reflectante', descripcion: 'Alta visibilidad' },
    { nombre: 'Tapones auditivos', descripcion: 'Proteccion contra ruido' }
  ];

  for (const epp of epps) {
    await prisma.epp.create({ data: epp });
  }

  console.log('Base de datos sembrada con exito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
