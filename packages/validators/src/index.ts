import { z } from 'zod';

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// Transaction schemas
export const transactionTypeEnum = z.enum(['income', 'expense']);

export const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: transactionTypeEnum,
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  note: z.string().max(500).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: transactionTypeEnum.optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
});

export const updateCategorySchema = createCategorySchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
