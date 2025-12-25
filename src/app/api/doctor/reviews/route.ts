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

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

    const reviews = await (prisma as any).review.findMany({ where: { doctorId: doctor.id }, include: { user: true, appointment: true }, orderBy: { createdAt: 'desc' } });

    const formatted = reviews.map((r: any) => ({
      id: r.id,
      appointmentId: r.appointmentId,
      rating: r.rating,
      comment: r.comment,
      patient: { id: r.user.id, name: `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || r.user.email },
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
