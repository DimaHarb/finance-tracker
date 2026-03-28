import { prisma } from '@finance-tracker/db';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const [incomeResult, expenseResult, recentTransactions, monthlyData] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'income' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'expense' },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.transaction.findMany({
        where: { userId },
        select: { amount: true, type: true, date: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount ?? 0;
    const totalExpenses = expenseResult._sum.amount ?? 0;
    const balance = totalIncome - totalExpenses;

    // Aggregate monthly data for chart
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    for (const t of monthlyData) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) ?? { income: 0, expense: 0 };
      if (t.type === 'income') {
        entry.income += t.amount;
      } else {
        entry.expense += t.amount;
      }
      monthlyMap.set(key, entry);
    }

    const chartData = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({
        month,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
      }));

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions,
      chartData,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
