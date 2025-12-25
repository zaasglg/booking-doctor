import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

/**
 * API for doctors to list and update their appointments
 * GET  - list appointments for authenticated doctor
 * PATCH - update appointment status (doctor only)
 */

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied: Doctors only' }, { status: 403 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { user: true, service: true },
      orderBy: { date: 'asc' },
    });

    const formatted = appointments.map((apt: any) => ({
      id: apt.id,
      patient: {
        id: apt.user.id,
        name: `${apt.user.firstName || ''} ${apt.user.lastName || ''}`.trim() || apt.user.email,
        email: apt.user.email,
        phone: apt.user.phone,
      },
      date: apt.date.toISOString().split('T')[0],
      time: apt.time,
      status: apt.status.toLowerCase(),
      serviceName: apt.service?.name || null,
      notes: apt.notes || null,
    }));

    return NextResponse.json({ doctorId: doctor.id, appointments: formatted });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    if (payload.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied: Doctors only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.userId } });
    if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: 'Appointment not found or access denied' }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: { user: true, service: true },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status.toLowerCase(),
      patient: {
        id: updated.user.id,
        name: `${updated.user.firstName || ''} ${updated.user.lastName || ''}`.trim() || updated.user.email,
      },
    });
  } catch (err) {
    console.error('Error updating appointment by doctor:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
