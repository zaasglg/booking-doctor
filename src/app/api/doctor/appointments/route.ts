import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'DOCTOR') {
            return NextResponse.json({ error: 'Access denied: Doctors only' }, { status: 403 });
        }

        // Find the doctor profile associated with this user
        const doctorProfile = await prisma.doctor.findUnique({
            where: { userId: payload.userId }
        });

        if (!doctorProfile) {
            return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
        }

        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctorProfile.id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        dateOfBirth: true,
                        avatar: true
                    }
                },
                service: true
            },
            orderBy: { date: 'asc' }
        });

        const formattedAppointments = appointments.map((apt: any) => ({
            id: apt.id,
            patientId: apt.user.id,
            patientName: `${apt.user.firstName} ${apt.user.lastName || ''}`.trim(),
            date: apt.date.toISOString(),
            time: apt.time,
            status: apt.status,
            serviceName: apt.service?.name,
            notes: apt.notes
        }));

        return NextResponse.json(formattedAppointments);

    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}
