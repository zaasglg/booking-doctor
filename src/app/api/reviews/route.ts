import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (appointmentId) {
      const review = await (prisma as any).review.findUnique({ where: { appointmentId } });
      if (!review) return NextResponse.json(null);
      return NextResponse.json({ id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt });
    }

    // If no appointmentId provided, return reviews by user
  const reviews = await (prisma as any).review.findMany({ where: { userId: payload.userId }, include: { doctor: true, appointment: true } });
  return NextResponse.json(reviews.map((r: any) => ({ id: r.id, rating: r.rating, comment: r.comment, doctorId: r.doctorId, appointmentId: r.appointmentId, createdAt: r.createdAt })));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { appointmentId, rating, comment } = body;
    if (!appointmentId || typeof rating !== 'number') return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Verify appointment ownership and status
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.userId !== payload.userId) return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 });

    // Optionally ensure appointment is completed
    if (appointment.status.toUpperCase() !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed appointments' }, { status: 400 });
    }

    // Prevent duplicate review for same appointment
    const existing = await (prisma as any).review.findUnique({ where: { appointmentId } });
    if (existing) return NextResponse.json({ error: 'Review already exists' }, { status: 400 });

    const review = await (prisma as any).review.create({
      data: {
        appointmentId,
        userId: payload.userId,
        doctorId: appointment.doctorId,
        rating,
        comment,
      }
    });

    // Recalculate doctor's average rating
    const agg = await (prisma as any).review.aggregate({ where: { doctorId: appointment.doctorId }, _avg: { rating: true } });
    if (agg._avg && agg._avg.rating) {
      await prisma.doctor.update({ where: { id: appointment.doctorId }, data: { rating: agg._avg.rating } });
    }

    return NextResponse.json({ id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
