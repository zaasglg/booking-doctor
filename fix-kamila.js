const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixKamilaRole() {
  try {
    console.log('Исправляем роль Камилы Ибрагимовой...');

    const kamila = await prisma.user.findFirst({
      where: {
        firstName: 'Камила',
        lastName: 'Ибрагимова'
      }
    });

    if (!kamila) {
      console.log('Пользователь Камила не найден');
      return;
    }

    await prisma.user.update({
      where: { id: kamila.id },
      data: { role: 'DOCTOR' }
    });

    console.log('✅ Роль изменена на DOCTOR');

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: kamila.id }
    });

    if (healthProfile) {
      await prisma.healthProfile.delete({
        where: { id: healthProfile.id }
      });
      console.log('✅ Удален healthProfile');
    }

    const doctor = await prisma.doctor.findFirst({
      where: {
        firstName: 'Камила',
        lastName: 'Ибрагимова'
      }
    });

    if (doctor) {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { userId: kamila.id }
      });

      console.log(`✅ Связан с врачом: ${doctor.firstName} ${doctor.lastName} ${doctor.middleName} (${doctor.specialty})`);
    } else {
      console.log('❌ Врач Камила Ибрагимова не найден');
    }

    console.log('\n✅ Исправление завершено!');

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKamilaRole();