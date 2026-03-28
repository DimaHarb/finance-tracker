import { prisma } from '@finance-tracker/db';
import { signInSchema } from '@finance-tracker/validators';
import { verifyPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
