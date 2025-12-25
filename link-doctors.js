const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkRemainingDoctors() {
  try {
    console.log('Связываем оставшихся врачей с пользователями...');

    const doctorUsers = await prisma.user.findMany({
      where: { role: 'DOCTOR' }
    });

    for (const user of doctorUsers) {
      const existingLink = await prisma.doctor.findFirst({
        where: { userId: user.id }
      });

      if (!existingLink) {
        const doctor = await prisma.doctor.findFirst({
          where: {
            firstName: user.firstName,
            lastName: user.lastName
          }
        });

        if (doctor) {
          await prisma.doctor.update({
            where: { id: doctor.id },
            data: { userId: user.id }
          });

          console.log(`✅ Связан: ${user.firstName} ${user.lastName} -> ${doctor.firstName} ${doctor.lastName} ${doctor.middleName} (${doctor.specialty})`);
        } else {
          console.log(`❌ Не найден врач для: ${user.firstName} ${user.lastName}`);
        }
      }
    }

    console.log('\n✅ Связывание завершено!');

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkRemainingDoctors();