'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { IncomeExpenseChart } from '@/components/income-expense-chart';

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    note: string | null;
    date: string;
    category: { name: string };
  }>;
  chartData: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your financial overview at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group relative overflow-hidden border-0 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-0 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-0 shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 to-violet-600" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
              {formatCurrency(data.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {data.chartData.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={data.chartData} />
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Add your first transaction to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {t.category.name}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{t.note ?? '-'}</TableCell>
                    <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
