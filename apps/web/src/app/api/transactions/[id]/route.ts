import { prisma } from '@finance-tracker/db';
import { updateTransactionSchema } from '@finance-tracker/validators';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
      include: { category: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const body = await request.json();
    const result = updateTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = { ...result.data };
    if (result.data.date) {
      data.date = new Date(result.data.date);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
