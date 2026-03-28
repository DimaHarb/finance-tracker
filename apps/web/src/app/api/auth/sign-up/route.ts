import { prisma } from '@finance-tracker/db';
import { signUpSchema } from '@finance-tracker/validators';
import { hashPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
