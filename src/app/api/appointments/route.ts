import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const appointments = await prisma.appointment.findMany({
            where: { userId: payload.userId },
            orderBy: { date: 'desc' },
            include: {
                doctor: true,
                service: true
            }
        });

        const formattedAppointments = appointments.map((apt: any) => ({
            id: apt.id,
            doctorName: `${apt.doctor.lastName} ${apt.doctor.firstName}`,
            specialty: apt.doctor.specialty,
            date: apt.date.toISOString().split('T')[0],
            time: apt.time,
            status: apt.status.toLowerCase() === 'pending' ? 'upcoming' : apt.status.toLowerCase(),
            clinic: "Клиника Booking Doctor", // Placeholder
            address: "ул. Примерная, 123", // Placeholder
            phone: "+7 (777) 123-45-67", // Placeholder
            serviceName: apt.service?.name || "Консультация",
            price: apt.service?.price || 0
        }));

        return NextResponse.json(formattedAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { doctorId, serviceId, date, time } = body;

        if (!doctorId || !date || !time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                userId: payload.userId,
                doctorId: doctorId,
                serviceId: serviceId,
                date: new Date(date),
                time: time,
                status: "UPCOMING"
            },
            include: {
                doctor: true,
                service: true
            }
        });

        // Create Payment record
        if (appointment.serviceId) {
            const service = await prisma.service.findUnique({
                where: { id: appointment.serviceId }
            });

            if (service) {
                await prisma.payment.create({
                    data: {
                        userId: payload.userId,
                        appointmentId: appointment.id,
                        amount: service.price,
                        status: "PENDING",
                        method: "card" // Default for now
                    }
                });
            }
        }

        return NextResponse.json({
            id: appointment.id,
            doctorName: `${appointment.doctor.lastName} ${appointment.doctor.firstName}`,
            specialty: appointment.doctor.specialty,
            date: appointment.date.toISOString().split('T')[0],
            time: appointment.time,
            status: appointment.status.toLowerCase(),
            clinic: "Клиника Booking Doctor",
            address: "ул. Примерная, 123",
            phone: "+7 (777) 123-45-67",
            serviceName: appointment.service?.name,
            price: appointment.service?.price
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        // Check if appointment belongs to user
        const existingAppointment = await prisma.appointment.findUnique({
            where: { id }
        });

        if (!existingAppointment || existingAppointment.userId !== payload.userId) {
            return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 });
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: status.toUpperCase() },
            include: {
                doctor: true,
                service: true
            }
        });

        return NextResponse.json({
            id: updatedAppointment.id,
            doctorName: `${updatedAppointment.doctor.lastName} ${updatedAppointment.doctor.firstName}`,
            specialty: updatedAppointment.doctor.specialty,
            date: updatedAppointment.date.toISOString().split('T')[0],
            time: updatedAppointment.time,
            status: updatedAppointment.status.toLowerCase(),
            clinic: "Клиника Booking Doctor",
            address: "ул. Примерная, 123",
            phone: "+7 (777) 123-45-67",
            serviceName: updatedAppointment.service?.name,
            price: updatedAppointment.service?.price
        });

    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
}
