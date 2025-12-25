import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { paymentId, paymentMethodId } = body;

        if (!paymentId || !paymentMethodId) {
            return NextResponse.json({ error: 'Missing paymentId or paymentMethodId' }, { status: 400 });
        }

        // Verify payment ownership and status
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment || payment.userId !== payload.userId) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
        }

        // Verify payment method ownership
        const method = await prisma.paymentMethod.findUnique({
            where: { id: paymentMethodId }
        });

        if (!method || method.userId !== payload.userId) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
        }

        // Simulate payment processing (success)
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'COMPLETED',
                method: method.type,
                transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                updatedAt: new Date()
            }
        });

        // Also update the appointment status if linked
        if (updatedPayment.appointmentId) {
            await prisma.appointment.update({
                where: { id: updatedPayment.appointmentId },
                data: { status: 'CONFIRMED' } // Or whatever status means "paid/ready"
            });
        }

        return NextResponse.json({ success: true, payment: updatedPayment });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }
}
