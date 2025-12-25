import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, phone, birthDate, address, gender } = body;

        // Split name into first and last
        let firstName, lastName;
        if (name) {
            const parts = name.trim().split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || undefined;
        }

        // Prepare update data
        const updateData: any = {
            email,
            phone,
        };

        if (firstName) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (birthDate) updateData.dateOfBirth = new Date(birthDate);

        // Note: address and gender are not currently in the schema, 
        // so we verify if we should add them or just ignore them for now.
        // Assuming we only update what's in the schema.

        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                birthDate: updatedUser.dateOfBirth
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                avatar: user.avatar,
                birthDate: user.dateOfBirth
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
