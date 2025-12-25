const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultSpecialties = [
  'Терапевт', 'Кардиолог', 'Невролог', 'Педиатр', 'Офтальмолог',
  'Хирург', 'Стоматолог', 'Дерматолог', 'Гинеколог', 'Уролог'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function createDoctorProfiles() {
  try {
    // Найдем всех пользователей с ролью DOCTOR
    const doctorUsers = await prisma.user.findMany({ where: { role: 'DOCTOR' } });

    if (!doctorUsers.length) {
      console.log('Нет пользователей с ролью DOCTOR');
      return;
    }

    for (const user of doctorUsers) {
      // Проверим есть ли уже профиль врача, связанный с этим пользователем
      let doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });

      if (doctor) {
        console.log(`Профиль врача уже существует для пользователя ${user.email} (doctorId=${doctor.id})`);
        continue;
      }

      // Создаем профиль врача, копируя имя/фамилию из пользователя и ставя дефолтные данные
      const firstName = user.firstName || user.email.split('@')[0];
      const lastName = user.lastName || '';
      const specialty = getRandomElement(defaultSpecialties);
      const experience = Math.floor(Math.random() * 20) + 3;

      doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          middleName: '',
          avatar: user.avatar || null,
          specialty,
          experience,
          education: 'Медицинский университет (демо)',
          bio: `${specialty} с опытом работы ${experience} лет. Профиль создан автоматически.`,
          rating: 4.5,
          isAvailable: true,
          services: {
            create: [
              { name: 'Первичная консультация', price: 5000, duration: 30 },
              { name: 'Повторный прием', price: 3000, duration: 20 }
            ]
          }
        }
      });

      console.log(`Создан профиль врача для ${user.email}: doctorId=${doctor.id} (${specialty})`);
    }

    const totalDocs = await prisma.doctor.count();
    console.log(`\nВсего врачей в базе: ${totalDocs}`);
  } catch (err) {
    console.error('Ошибка при создании профилей врачей:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createDoctorProfiles();
