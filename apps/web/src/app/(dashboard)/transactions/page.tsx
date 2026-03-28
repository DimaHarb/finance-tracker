'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  date: string;
  categoryId: string;
  category: Category;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState('expense');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      sortBy,
      sortOrder,
    });
    if (filterType !== 'all') params.set('type', filterType);
    if (filterCategory !== 'all') params.set('categoryId', filterCategory);
    if (search) params.set('search', search);

    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions);
    setPagination(data.pagination);
    setLoading(false);
  }, [filterType, filterCategory, sortBy, sortOrder, search]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  function resetForm() {
    setFormAmount('');
    setFormType('expense');
    setFormCategory('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNote('');
    setFormError('');
    setEditingId(null);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(t: Transaction) {
    setEditingId(t.id);
    setFormAmount(String(t.amount));
    setFormType(t.type);
    setFormCategory(t.categoryId);
    setFormDate(new Date(t.date).toISOString().split('T')[0]);
    setFormNote(t.note ?? '');
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const body = {
      amount: parseFloat(formAmount),
      type: formType,
      categoryId: formCategory,
      date: formDate,
      note: formNote || undefined,
    };

    try {
      const url = editingId ? `/api/transactions/${editingId}` : '/api/transactions';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? 'Failed to save');
        return;
      }

      setDialogOpen(false);
      resetForm();
      fetchTransactions(pagination.page);
    } catch {
      setFormError('Something went wrong');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    fetchTransactions(pagination.page);
  }

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track all your transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the transaction details below.' : 'Fill in the details to create a new transaction.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note (optional)</Label>
                <Input
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Add a note..."
                  maxLength={500}
                />
              </div>
              <Button type="submit" className="h-10 w-full font-semibold" disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Search</Label>
              <Input
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {pagination.total} transaction{pagination.total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button onClick={() => toggleSort('date')} className="flex items-center gap-1 font-medium transition-colors hover:text-foreground">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 font-medium transition-colors hover:text-foreground">
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} className="group">
                      <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {t.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {t.category.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{t.note ?? '-'}</TableCell>
                      <TableCell className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(t)} className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchTransactions(pagination.page - 1)}
                      className="h-8"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchTransactions(pagination.page + 1)}
                      className="h-8"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
