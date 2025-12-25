import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

// Ensure this route is protected or restricted in production!
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, specialty, phone } = body;

        if (!email || !password || !firstName || !specialty) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        // Transaction to create User and Doctor profile together
        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phone,
                    role: 'DOCTOR'
                }
            });

            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    specialty,
                    isAvailable: true
                }
            });

            return { user, doctor };
        });

        const token = generateToken({
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role
        });

        return NextResponse.json({
            success: true,
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role
            },
            doctor: result.doctor,
            token
        });

    } catch (error) {
        console.error('Error creating doctor:', error);
        return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
    }
}
