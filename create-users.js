const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
];

// Функция транслитерации казахских символов на английский
function transliterate(text) {
    const map = {
        'А': 'A', 'а': 'a', 'Ә': 'A', 'ә': 'a', 'Б': 'B', 'б': 'b',
        'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g', 'Ғ': 'G', 'ғ': 'g',
        'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Ё': 'E', 'ё': 'e',
        'Ж': 'Zh', 'ж': 'zh', 'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i',
        'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k', 'Қ': 'Q', 'қ': 'q',
        'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
        'Ң': 'N', 'ң': 'n', 'О': 'O', 'о': 'o', 'Ө': 'O', 'ө': 'o',
        'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's',
        'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u', 'Ұ': 'U', 'ұ': 'u',
        'Ү': 'U', 'ү': 'u', 'Ф': 'F', 'ф': 'f', 'Х': 'Kh', 'х': 'kh',
        'Һ': 'H', 'һ': 'h', 'Ц': 'Ts', 'ц': 'ts', 'Ч': 'Ch', 'ч': 'ch',
        'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Shch', 'щ': 'shch', 'Ъ': '', 'ъ': '',
        'Ы': 'Y', 'ы': 'y', 'Ь': '', 'ь': '', 'Э': 'E', 'э': 'e',
        'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya'
    };

    return text.split('').map(char => map[char] || char).join('');
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedUsers() {
    console.log('Удаление старых пользователей (кроме админа)...');
    await prisma.user.deleteMany({
        where: {
            role: {
                not: 'ADMIN'
            }
        }
    });

    console.log('Создание 20 демо-пользователей...\n');

    for (let i = 0; i < 20; i++) {
        const name = kazakhNames[i % kazakhNames.length];
        const email = `${transliterate(name.firstName).toLowerCase()}.${transliterate(name.lastName).toLowerCase()}@example.com`;
        const hashedPassword = await bcrypt.hash('password123', 10);

        const birthDate = getRandomDate(new Date(1950, 0, 1), new Date(2005, 11, 31));

        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                firstName: name.firstName,
                lastName: name.lastName,
                phone: `+7${getRandomInt(700, 799)}${getRandomInt(1000000, 9999999)}`,
                dateOfBirth: birthDate,
                role: Math.random() > 0.1 ? 'PATIENT' : 'DOCTOR', // 90% пациентов, 10% врачей
                healthProfile: {
                    create: {
                        height: `${getRandomInt(150, 200)}`,
                        weight: `${getRandomInt(50, 120)}`,
                        bloodPressure: `${getRandomInt(110, 140)}/${getRandomInt(70, 90)}`,
                        bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][getRandomInt(0, 7)],
                        allergies: JSON.stringify({
                            medications: Math.random() > 0.7 ? ['Аспирин', 'Пенициллин'] : [],
                            food: Math.random() > 0.8 ? ['Орехи', 'Молоко'] : [],
                            environmental: Math.random() > 0.9 ? ['Пыльца', 'Пыль'] : []
                        }),
                        chronicConditions: JSON.stringify({
                            conditions: Math.random() > 0.8 ? ['Гипертония', 'Диабет'] : [],
                            medications: Math.random() > 0.7 ? ['Метформин', 'Лизиноприл'] : []
                        })
                    }
                }
            },
        });

        console.log(`✓ ${user.firstName} ${user.lastName} — ${user.email} (${user.role})`);
    }

    const count = await prisma.user.count();
    console.log(`\n✅ Всего пользователей в базе: ${count}`);

    await prisma.$disconnect();
}

seedUsers().catch((e) => {
    console.error(e);
    process.exit(1);
});