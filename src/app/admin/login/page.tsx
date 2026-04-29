"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciais inválidas.");
      setLoading(false);
    } else {
      router.push(params.get("callbackUrl") ?? "/admin");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-cream">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-10 border border-warm-light"
      >
        <h1 className="font-serif text-3xl font-light text-ink mb-2">
          Painel <em className="italic text-accent">privado</em>
        </h1>
        <p className="text-xs uppercase tracking-[0.15em] text-warm-mid mb-8">
          Cláudia Alves Fotografia
        </p>

        <label className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-mid">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full bg-transparent border-0 border-b border-warm-light focus:border-accent outline-none py-2 mb-6 text-sm"
        />

        <label className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-mid">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="w-full bg-transparent border-0 border-b border-warm-light focus:border-accent outline-none py-2 mb-8 text-sm"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          <span>{loading ? "A entrar..." : "Entrar →"}</span>
        </button>
      </form>
    </main>
  );
}
