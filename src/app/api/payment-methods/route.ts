import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const methods = await prisma.paymentMethod.findMany({
            where: {
                userId: payload.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Ensure isDefault logic is consistent if multiple defaults exist (shouldn't happen but good for safety)
        // Or if none are default, maybe making the first one default on the frontend side is distinct from backend.
        // We just return as is.

        return NextResponse.json(methods);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { type, name, number, isDefault } = body;

        if (!type || !name || !number) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if this is the first method, if so make it default automatically
        const count = await prisma.paymentMethod.count({
            where: { userId: payload.userId }
        });

        let shouldBeDefault = isDefault || count === 0;

        if (shouldBeDefault) {
            // Unset other defaults
            await prisma.paymentMethod.updateMany({
                where: { userId: payload.userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const newMethod = await prisma.paymentMethod.create({
            data: {
                userId: payload.userId,
                type,
                name,
                number, // In a real app, you'd encrypt or tokenize this!
                isDefault: shouldBeDefault
            }
        });

        return NextResponse.json(newMethod);
    } catch (error) {
        console.error('Error adding payment method:', error);
        return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { id, isDefault, name, number, type } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Verify ownership
        const existing = await prisma.paymentMethod.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== payload.userId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (isDefault) {
            // Unset other defaults
            await prisma.paymentMethod.updateMany({
                where: { userId: payload.userId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.paymentMethod.update({
            where: { id },
            data: {
                name,
                number,
                type,
                isDefault // undefined fields will be ignored by prisma update if not passed, but let's be careful
                // Actually passing undefined to prisma update behaves well, it skips them.
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error('Error updating payment method:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const existing = await prisma.paymentMethod.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== payload.userId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await prisma.paymentMethod.delete({
            where: { id }
        });

        // If we deleted the default one, make the most recent one default?
        if (existing.isDefault) {
            const mostRecent = await prisma.paymentMethod.findFirst({
                where: { userId: payload.userId },
                orderBy: { createdAt: 'desc' }
            });
            if (mostRecent) {
                await prisma.paymentMethod.update({
                    where: { id: mostRecent.id },
                    data: { isDefault: true }
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting payment method:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
