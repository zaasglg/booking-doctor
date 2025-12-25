const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    try {
        const admin = await prisma.user.upsert({
            where: { email: 'admin@example.com' },
            update: { role: 'ADMIN' },
            create: {
                email: 'admin@example.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
            },
        });
        console.log('Admin user created/updated:', admin.email);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
