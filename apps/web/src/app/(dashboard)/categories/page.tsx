'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function resetForm() {
    setFormName('');
    setFormError('');
    setEditingId(null);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(c: Category) {
    setEditingId(c.id);
    setFormName(c.name);
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? 'Failed to save');
        return;
      }

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch {
      setFormError('Something went wrong');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? 'Failed to delete');
      return;
    }
    fetchCategories();
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your transactions with categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Category' : 'New Category'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update the category name below.' : 'Enter a name for the new category.'}
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
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Category name"
                  required
                  maxLength={50}
                />
              </div>
              <Button type="submit" className="h-10 w-full font-semibold" disabled={formLoading}>
                {formLoading ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
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
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No categories yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Create your first category to organize transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} className="group">
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium">
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(c)} className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
