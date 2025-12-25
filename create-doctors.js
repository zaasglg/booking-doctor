const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const kazakhNames = [
    { firstName: 'Асан', lastName: 'Саматов', middleName: 'Бекетович' },
    { firstName: 'Айгуль', lastName: 'Нургалиева', middleName: 'Серікқызы' },
    { firstName: 'Бауыржан', lastName: 'Ахметов', middleName: 'Қайратұлы' },
    { firstName: 'Динара', lastName: 'Жумабекова', middleName: 'Ерболқызы' },
    { firstName: 'Ерлан', lastName: 'Сейтжанов', middleName: 'Талғатұлы' },
    { firstName: 'Жанар', lastName: 'Оспанова', middleName: 'Маратқызы' },
    { firstName: 'Қанат', lastName: 'Бекмұратов', middleName: 'Нұрланұлы' },
    { firstName: 'Мадина', lastName: 'Тұрсынбаева', middleName: 'Асқарқызы' },
    { firstName: 'Нұрлан', lastName: 'Қасымов', middleName: 'Болатұлы' },
    { firstName: 'Сауле', lastName: 'Әбдірахманова', middleName: 'Жанатқызы' },
    { firstName: 'Тимур', lastName: 'Есенов', middleName: 'Бақытжанұлы' },
    { firstName: 'Алия', lastName: 'Мұратбекова', middleName: 'Дәуренқызы' },
    { firstName: 'Дәулет', lastName: 'Сарсенбаев', middleName: 'Ғалымұлы' },
    { firstName: 'Гүлназ', lastName: 'Төлегенова', middleName: 'Ержанқызы' },
    { firstName: 'Арман', lastName: 'Жәнібеков', middleName: 'Сәкенұлы' },
    { firstName: 'Әсел', lastName: 'Қуандықова', middleName: 'Айбекқызы' },
    { firstName: 'Бақыт', lastName: 'Омаров', middleName: 'Серікұлы' },
    { firstName: 'Камила', lastName: 'Ибрагимова', middleName: 'Рустамқызы' },
    { firstName: 'Ержан', lastName: 'Нұрмағамбетов', middleName: 'Қайратұлы' },
    { firstName: 'Назгүл', lastName: 'Байғазиева', middleName: 'Мұратқызы' },
    { firstName: 'Самат', lastName: 'Құдайберген', middleName: 'Асланұлы' },
    { firstName: 'Ләйла', lastName: 'Сүлейменова', middleName: 'Ержанқызы' },
    { firstName: 'Азамат', lastName: 'Тоқтарбаев', middleName: 'Бауыржанұлы' },
    { firstName: 'Айнұр', lastName: 'Жексенбаева', middleName: 'Талғатқызы' },
    { firstName: 'Риза', lastName: 'Әлиев', middleName: 'Нұрболұлы' },
];

const specialties = [
    'Терапевт', 'Кардиолог', 'Невролог', 'Педиатр', 'Офтальмолог',
    'Хирург', 'Стоматолог', 'Дерматолог', 'Гинеколог', 'Уролог',
    'Эндокринолог', 'Гастроэнтеролог', 'Пульмонолог', 'Онколог', 'Травматолог',
    'Отоларинголог', 'Психиатр', 'Ревматолог', 'Нефролог', 'Аллерголог'
];

const universities = [
    'Казахский Национальный Медицинский Университет им. С.Д. Асфендиярова',
    'Медицинский университет Астана',
    'Казахстанско-Российский Медицинский Университет',
    'Медицинский университет Караганды',
    'Медицинский университет Семей',
    'Западно-Казахстанский медицинский университет им. М. Оспанова',
    'Южно-Казахстанская медицинская академия',
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDoctors() {
    console.log('Удаление старых врачей...');
    await prisma.doctor.deleteMany({});

    console.log('Создание 25 демо-врачей с казахскими именами...\n');

    for (let i = 0; i < 25; i++) {
        const name = kazakhNames[i % kazakhNames.length];
        const specialty = specialties[i % specialties.length];
        const experience = getRandomInt(5, 30);
        const rating = (getRandomInt(40, 50) / 10).toFixed(1);
        const price = getRandomInt(3, 20) * 1000;

        const doctor = await prisma.doctor.create({
            data: {
                firstName: name.firstName,
                lastName: name.lastName,
                middleName: name.middleName,
                specialty: specialty,
                experience: experience,
                education: getRandomElement(universities),
                bio: `${specialty} с опытом работы ${experience} лет. Высококвалифицированный специалист, использующий современные методы диагностики и лечения.`,
                rating: parseFloat(rating),
                isAvailable: Math.random() > 0.1, // 90% доступны
                services: {
                    create: [
                        { name: 'Первичная консультация', price: price, duration: 30 },
                        { name: 'Повторный прием', price: Math.max(2000, price - 2000), duration: 20 },
                        { name: 'Онлайн консультация', price: Math.max(2000, price - 1000), duration: 30 }
                    ]
                }
            },
        });

        console.log(`✓ ${doctor.lastName} ${doctor.firstName} ${doctor.middleName} — ${specialty}`);
    }

    const count = await prisma.doctor.count();
    console.log(`\n✅ Всего врачей в базе: ${count}`);

    await prisma.$disconnect();
}

seedDoctors().catch(console.error);
