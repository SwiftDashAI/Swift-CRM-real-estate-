import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-center">
      <h1 className="text-2xl font-semibold text-ink-900">Not found</h1>
      <p className="text-sm text-ink-600">This page doesn&apos;t exist or you don&apos;t have access to it.</p>
      <Link href="/dashboard" className="btn-primary mt-2">Back to dashboard</Link>
    </div>
  );
}
