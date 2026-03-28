import { prisma } from '@finance-tracker/db';
import { createTransactionSchema, transactionQuerySchema } from '@finance-tracker/validators';
import { requireAuth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = transactionQuerySchema.parse(searchParams);

    const where: Record<string, unknown> = { userId: session.userId };
    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.note = { contains: query.search };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
        userId: session.userId,
      },
      include: { category: true },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
