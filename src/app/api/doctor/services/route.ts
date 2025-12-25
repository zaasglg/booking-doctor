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

    const services = await prisma.service.findMany({ where: { doctorId: doctor.id }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({ services });
  } catch (err) {
    console.error('Error fetching services:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const body = await request.json();
    const { name, price, duration } = body;
    if (!name || typeof price !== 'number') return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

    const service = await prisma.service.create({ data: { doctorId: doctor.id, name, price, duration: duration || 30 } });

    return NextResponse.json({ service });
  } catch (err) {
    console.error('Error creating service:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
