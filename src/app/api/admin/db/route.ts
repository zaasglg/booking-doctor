import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/jwt";

// Список доступных таблиц на основе Prisma Schema
const TABLES = [
    { id: "user", name: "Users", icon: "Users" },
    { id: "doctor", name: "Doctors", icon: "Stethoscope" },
    { id: "appointment", name: "Appointments", icon: "Calendar" },
    { id: "favorite", name: "Favorites", icon: "Heart" },
    { id: "medicalRecord", name: "Medical Records", icon: "FileText" },
    { id: "healthProfile", name: "Health Profiles", icon: "Activity" },
    { id: "service", name: "Services", icon: "Briefcase" },
    { id: "payment", name: "Payments", icon: "CreditCard" },
];

async function checkAdmin(request: Request) {
    const token = getTokenFromRequest(request);
    if (!token) return false;

    const payload = verifyToken(token);
    if (!payload) return false;

    const user = await prisma.user.findUnique({
        where: { id: payload.userId }
    });

    return user?.role === 'ADMIN';
}

export async function GET(request: Request) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");

    try {
        console.log("DB API: Requested table", table || "ALL STATS");

        if (!table) {
            // Возвращаем список таблиц и их количество записей
            const stats = await Promise.all(
                TABLES.map(async (t) => {
                    try {
                        const model = (prisma as any)[t.id];
                        if (!model) {
                            console.warn(`Model ${t.id} not found in Prisma client`);
                            return { ...t, count: 0 };
                        }
                        const count = await model.count();
                        return { ...t, count };
                    } catch (e) {
                        console.error(`Error counting ${t.id}:`, e);
                        return { ...t, count: 0 };
                    }
                })
            );
            return NextResponse.json(stats);
        }

        // Если указана таблица, возвращаем ее данные
        const model = (prisma as any)[table];
        if (!model) {
            console.error(`Table ${table} not found. Available models:`, Object.keys(prisma).filter(k => !k.startsWith('_')));
            return NextResponse.json({ error: `Table ${table} not found` }, { status: 404 });
        }

        const data = await model.findMany({
            take: 100, // Лимит для производительности
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("CRITICAL DB API ERROR:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const id = searchParams.get("id");

    if (!table || !id) {
        return NextResponse.json({ error: "Missing table or id" }, { status: 400 });
    }

    try {
        await (prisma as any)[table].delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
