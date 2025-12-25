import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const appointmentId = request.nextUrl.searchParams.get('appointmentId');
    if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.doctorId !== doctor.id) return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 });

    const payment = await prisma.payment.findFirst({ where: { appointmentId: appointmentId } });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    const formatted = {
      id: payment.id,
      appointmentId: payment.appointmentId,
      amount: payment.amount,
      status: payment.status.toLowerCase(),
      paymentMethod: payment.method || 'card',
      transactionId: payment.transactionId || `TXN_${payment.id.slice(-6)}`,
      createdAt: payment.createdAt.toISOString(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching doctor payment:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
