import { prisma } from '@finance-tracker/db';
import { updateCategorySchema } from '@finance-tracker/validators';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const duplicate = await prisma.category.findFirst({
      where: { name: result.data.name, id: { not: id } },
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: result.data,
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    });
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing transactions' },
        { status: 400 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
