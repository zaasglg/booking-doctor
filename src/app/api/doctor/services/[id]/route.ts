import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // extract id from url
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    const body = await request.json();
    const { name, price, duration } = body;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor || service.doctorId !== doctor.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const updated = await prisma.service.update({ where: { id }, data: { name: name ?? service.name, price: typeof price === 'number' ? price : service.price, duration: typeof duration === 'number' ? duration : service.duration } });

    return NextResponse.json({ service: updated });
  } catch (err) {
    console.error('Error updating service:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // extract id from url
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor || service.doctorId !== doctor.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting service:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
