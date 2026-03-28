export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-60 w-60 -translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <span className="text-2xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FinTracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Smart personal finance management</p>
        </div>
        {children}
      </div>
    </div>
  );
}
