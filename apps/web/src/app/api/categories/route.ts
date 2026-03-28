import { prisma } from '@finance-tracker/db';
import { createCategorySchema } from '@finance-tracker/validators';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requireAuth();
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({
      where: { name: result.data.name },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 },
      );
    }

    const category = await prisma.category.create({ data: result.data });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
