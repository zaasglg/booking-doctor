import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const favorites = await prisma.favorite.findMany({
            where: {
                userId: payload.userId
            },
            include: {
                doctor: {
                    include: {
                        services: true
                    }
                }
            }
        });

        // Transform to return list of doctors
        const favoriteDoctors = favorites.map((fav: { doctor: any }) => fav.doctor);

        return NextResponse.json(favoriteDoctors);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { doctorId } = body;

        if (!doctorId) {
            return NextResponse.json({ error: 'doctorId is required' }, { status: 400 });
        }

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_doctorId: {
                    userId: payload.userId,
                    doctorId: doctorId
                }
            }
        });

        if (existingFavorite) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: {
                    id: existingFavorite.id
                }
            });
            return NextResponse.json({ isFavorite: false });
        } else {
            // Add to favorites
            await prisma.favorite.create({
                data: {
                    userId: payload.userId,
                    doctorId: doctorId
                }
            });
            return NextResponse.json({ isFavorite: true });
        }

    } catch (error) {
        console.error('Error toggling favorite:', error);
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
