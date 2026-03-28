import { requireAuth } from '@/lib/auth';
import { NavBar } from '@/components/nav-bar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 to-slate-100/30">
      <NavBar email={session.user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
