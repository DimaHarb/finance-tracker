'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

export function IncomeExpenseChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b' }}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b' }}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '13px', color: '#64748b' }}
        />
        <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}
