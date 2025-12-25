import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const doctorId = searchParams.get('doctorId');
        const date = searchParams.get('date');

        if (!doctorId || !date) {
            return NextResponse.json({ error: 'Missing doctorId or date' }, { status: 400 });
        }

        // Parse date strings to Date objects for querying
        // Assuming date is in YYYY-MM-DD format
        const queryDate = new Date(date);

        // Start of day
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);

        // End of day
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                // Exclude cancelled appointments if you want them to be free
                status: {
                    notIn: ["cancelled", "CANCELLED"]
                }
            },
            select: {
                time: true
            }
        });

        const unavailableSlots = appointments.map((apt: { time: string }) => apt.time);

        return NextResponse.json({ unavailableSlots });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
