import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const payments = await prisma.payment.findMany({
            where: {
                userId: payload.userId
            },
            include: {
                appointment: {
                    include: {
                        doctor: {
                            include: {
                                services: true
                            }
                        },
                        service: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedPayments = payments.map((payment: any) => ({
            id: payment.id,
            appointmentId: payment.appointmentId || "N/A",
            doctorName: payment.appointment?.doctor ? `${payment.appointment.doctor.lastName} ${payment.appointment.doctor.firstName}` : "Неизвестный врач",
            specialty: payment.appointment?.doctor?.specialty || "Общий",
            date: payment.appointment?.date ? payment.appointment.date.toISOString() : payment.createdAt.toISOString(),
            amount: payment.amount,
            status: payment.status.toLowerCase(), // Ensure lowercase for frontend mapping
            paymentMethod: payment.method || "card", // Default to card if null
            transactionId: payment.transactionId || `TXN_${payment.id.slice(-6)}`,
            clinic: "Медицинский центр DOQ", // Placeholder as clinic is not in DB yet
            description: payment.appointment?.service?.name || "Консультация врача"
        }));

        return NextResponse.json(formattedPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
