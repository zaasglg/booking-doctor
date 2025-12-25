import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Проверка авторизации
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Проверка типа файла
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, GIF allowed.' }, { status: 400 });
        }

        // Проверка размера (максимум 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // Создаем директорию для загрузок
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        await mkdir(uploadDir, { recursive: true });

        // Генерируем уникальное имя файла
        const ext = file.name.split('.').pop();
        const fileName = `${payload.userId}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        // Сохраняем файл
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // URL для доступа к файлу
        const avatarUrl = `/uploads/avatars/${fileName}`;

        // Обновляем аватар пользователя в базе данных
        await prisma.user.update({
            where: { id: payload.userId },
            data: { avatar: avatarUrl },
        });

        return NextResponse.json({
            success: true,
            avatarUrl,
            message: 'Photo uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
