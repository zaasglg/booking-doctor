import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Найдем профиль врача, связанный с этим пользователем
    const doctor = await prisma.doctor.findFirst({
      where: { userId: payload.userId },
      include: { services: true }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
