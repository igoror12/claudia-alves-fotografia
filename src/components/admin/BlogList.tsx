"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@prisma/client";

type PostWithAuthor = BlogPost & {
  author: { name: string | null; email: string };
};

const MONTHS_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatDate(d: Date) {
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

export function BlogList({ posts }: { posts: PostWithAuthor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <p className="text-sm text-warm-mid italic">
        Ainda sem posts. Clica em "+ Novo post" para começar.
      </p>
    );
  }

  async function togglePublished(id: string, current: boolean) {
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        published: !current,
        publishedAt: !current ? new Date().toISOString() : null,
      }),
    });
    if (!res.ok) {
      alert("Erro ao alterar publicação.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Apagar "${title}"? Acção irreversível.`)) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Erro ao remover.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="border border-warm-light bg-white px-6 py-4 flex items-start gap-6"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className={`text-[0.6rem] uppercase tracking-[0.15em] px-2 py-0.5 ${
                  p.published
                    ? "bg-green-700 text-white"
                    : "bg-warm-light text-warm-mid"
                }`}
              >
                {p.published ? "Publicado" : "Rascunho"}
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.1em] text-warm-mid">
                {p.category}
              </span>
            </div>
            <Link
              href={`/admin/blog/${p.id}`}
              className="font-serif text-lg text-ink hover:text-accent block truncate"
            >
              {p.title}
            </Link>
            <p className="text-xs text-warm-mid mt-1">
              {p.author.name ?? p.author.email} ·{" "}
              {p.publishedAt
                ? `publicado ${formatDate(new Date(p.publishedAt))}`
                : `criado ${formatDate(new Date(p.createdAt))}`}
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => togglePublished(p.id, p.published)}
              disabled={isPending}
              className="text-[0.65rem] uppercase tracking-[0.15em] border border-warm-light px-3 py-1.5 hover:border-ink"
            >
              {p.published ? "Despublicar" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => remove(p.id, p.title)}
              disabled={isPending}
              className="text-[0.65rem] uppercase tracking-[0.15em] text-red-600 px-3 py-1.5 hover:bg-red-50"
            >
              Apagar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
