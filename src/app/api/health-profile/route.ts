import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const profile = await prisma.healthProfile.findUnique({
            where: { userId: payload.userId },
        });

        if (!profile) {
            return NextResponse.json({
                height: "", weight: "", bloodPressure: "", heartRate: "", temperature: "", bloodType: "",
                allergies: { medications: [], food: [], environmental: [] },
                chronicConditions: { conditions: [], medications: [] }
            });
        }

        return NextResponse.json({
            ...profile,
            allergies: profile.allergies ? JSON.parse(profile.allergies) : { medications: [], food: [], environmental: [] },
            chronicConditions: profile.chronicConditions ? JSON.parse(profile.chronicConditions) : { conditions: [], medications: [] }
        });
    } catch (error) {
        console.error('Error fetching health profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { vitalSigns, allergies, chronicConditions } = body;

        const profile = await prisma.healthProfile.upsert({
            where: { userId: payload.userId },
            update: {
                height: vitalSigns.height,
                weight: vitalSigns.weight,
                bloodPressure: vitalSigns.bloodPressure,
                heartRate: vitalSigns.heartRate,
                temperature: vitalSigns.temperature,
                bloodType: vitalSigns.bloodType,
                allergies: JSON.stringify(allergies),
                chronicConditions: JSON.stringify(chronicConditions),
            },
            create: {
                userId: payload.userId,
                height: vitalSigns.height,
                weight: vitalSigns.weight,
                bloodPressure: vitalSigns.bloodPressure,
                heartRate: vitalSigns.heartRate,
                temperature: vitalSigns.temperature,
                bloodType: vitalSigns.bloodType,
                allergies: JSON.stringify(allergies),
                chronicConditions: JSON.stringify(chronicConditions),
            },
        });

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Error updating health profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
