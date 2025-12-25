import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const records = await prisma.medicalRecord.findMany({
            where: { userId: payload.userId },
            orderBy: { date: 'desc' }
        });

        const formattedRecords = records.map((record: any) => ({
            ...record,
            date: record.date.toISOString(),
            medications: record.medications ? record.medications.split(',') : [],
            attachments: record.attachments ? record.attachments.split(',') : [],
        }));

        return NextResponse.json(formattedRecords);
    } catch (error) {
        console.error('Error fetching medical records:', error);
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { date, doctorName, specialty, diagnosis, treatment, medications, notes, patientId } = body;

        let targetUserId = payload.userId;

        // If user is a Doctor, they can create records for others
        if (payload.role === 'DOCTOR') {
            if (!patientId) {
                return NextResponse.json({ error: 'Patient ID is required for doctors' }, { status: 400 });
            }
            targetUserId = patientId;
        }

        const record = await prisma.medicalRecord.create({
            data: {
                userId: targetUserId,
                date: new Date(date),
                doctorName: doctorName, // Could also look up doctor name from DB if we wanted
                specialty,
                diagnosis,
                treatment,
                medications: Array.isArray(medications) ? medications.join(',') : medications,
                notes,
            }
        });

        return NextResponse.json({
            ...record,
            date: record.date.toISOString(),
            medications: record.medications ? record.medications.split(',') : [],
            attachments: record.attachments ? record.attachments.split(',') : [],
        });
    } catch (error) {
        console.error('Error creating medical record:', error);
        return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Ensure user owns the record
        const record = await prisma.medicalRecord.findUnique({ where: { id } });
        if (!record || record.userId !== payload.userId) {
            return NextResponse.json({ error: 'Record not found or access denied' }, { status: 404 });
        }

        await prisma.medicalRecord.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting medical record:', error);
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }
}
