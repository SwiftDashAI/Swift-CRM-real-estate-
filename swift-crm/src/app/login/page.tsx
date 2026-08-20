"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } else {
      if (!fullName.trim()) {
        setLoading(false);
        setError("Please enter your name.");
        return;
      }
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
      } else {
        setSignedUp(true);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-sm text-ink-600">Never lose a customer.</p>
        </div>

        <div className="card p-6">
          {signedUp ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-ink-900">Check your email</h2>
              <p className="mt-2 text-sm text-ink-600">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>. Confirm it, then
                come back and log in.
              </p>
              <button
                className="btn-secondary mt-5 w-full"
                onClick={() => {
                  setSignedUp(false);
                  setMode("login");
                }}
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex rounded-lg bg-surface-muted p-1 text-sm">
                <button
                  className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                    mode === "login" ? "bg-white text-ink-900 shadow-card" : "text-ink-600"
                  }`}
                  onClick={() => setMode("login")}
                  type="button"
                >
                  Log in
                </button>
                <button
                  className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                    mode === "signup" ? "bg-white text-ink-900 shadow-card" : "text-ink-600"
                  }`}
                  onClick={() => setMode("signup")}
                  type="button"
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rahul Sharma"
                    />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {error && <p className="field-error">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          SwiftDash AI · Manage leads, properties, follow-ups and deals — all in one workspace.
        </p>
      </div>
    </div>
  );
}
