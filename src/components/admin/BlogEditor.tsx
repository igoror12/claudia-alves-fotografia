"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@prisma/client";

type Props = { post?: BlogPost };

// Categorias predefinidas (texto livre, mas estas ajudam consistência)
const CATEGORY_SUGGESTIONS = [
  "Casamentos",
  "Retratos",
  "Eventos",
  "Técnica",
  "Inspiração",
  "Diário",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function BlogEditor({ post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.coverUrl ?? "");
  const [category, setCategory] = useState(post?.category ?? "Casamentos");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(post?.metaDesc ?? "");

  // Auto-slug à medida que escreves o título (só se ainda não há slug manual)
  function onTitleChange(v: string) {
    setTitle(v);
    if (!post && (!slug || slug === slugify(title))) {
      setSlug(slugify(v));
    }
  }

  async function save(opts: { publish?: boolean } = {}) {
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      alert("Título, slug, resumo e conteúdo são obrigatórios.");
      return;
    }
    setSaving(true);

    const body = {
      title: title.trim(),
      slug: slugify(slug),
      excerpt: excerpt.trim(),
      content,
      coverUrl: coverUrl.trim() || null,
      category: category.trim(),
      metaTitle: metaTitle.trim() || null,
      metaDesc: metaDesc.trim() || null,
      ...(opts.publish !== undefined
        ? {
            published: opts.publish,
            publishedAt: opts.publish ? new Date().toISOString() : null,
          }
        : {}),
    };

    const url = post ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
    const method = post ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Erro: ${j.error ?? res.status}`);
        return;
      }
      startTransition(() => router.push("/admin/blog"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Field label="Título">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Como me preparo para um casamento"
          className="w-full bg-transparent border-b border-warm-light focus:border-accent outline-none py-3 font-serif text-2xl"
          required
        />
      </Field>

      <Field label="Slug (URL)">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="como-me-preparo-para-um-casamento"
          className="w-full bg-transparent border-b border-warm-light focus:border-accent outline-none py-2 font-mono text-sm"
          required
        />
        <span className="text-[0.65rem] text-warm-mid mt-1 block">
          claudiaalves.pt/blog/{slug || "..."}
        </span>
      </Field>

      <Field label="Categoria">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="cat-list"
          className="w-full bg-transparent border-b border-warm-light focus:border-accent outline-none py-2 text-sm"
          required
        />
        <datalist id="cat-list">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field label="Imagem de capa (URL)">
        <input
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://...blob.vercel-storage.com/...webp"
          className="w-full bg-transparent border-b border-warm-light focus:border-accent outline-none py-2 text-sm"
        />
        <span className="text-[0.65rem] text-warm-mid mt-1 block">
          Cola o URL "medium" duma foto que esteja no admin de fotografias.
        </span>
      </Field>

      <Field label="Resumo (excerpt)">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="2-3 frases que aparecem no card do blog na homepage."
          rows={3}
          className="w-full bg-transparent border border-warm-light focus:border-accent outline-none p-3 text-sm resize-none"
          required
        />
      </Field>

      <Field label="Conteúdo (Markdown)">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Título secundário&#10;&#10;Parágrafo normal. **negrito** e *itálico*.&#10;&#10;- lista&#10;- de pontos"
          rows={20}
          className="w-full bg-transparent border border-warm-light focus:border-accent outline-none p-3 text-sm font-mono resize-y"
          required
        />
        <span className="text-[0.65rem] text-warm-mid mt-1 block">
          Suporta Markdown: # H1, ## H2, **negrito**, *itálico*, [link](url), - listas, &gt; citações.
        </span>
      </Field>

      <details className="border border-warm-light p-4">
        <summary className="text-xs uppercase tracking-[0.15em] text-warm-mid cursor-pointer">
          SEO (opcional)
        </summary>
        <div className="flex flex-col gap-4 mt-4">
          <Field label="Meta title">
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Por defeito usa o título do post"
              className="w-full bg-transparent border-b border-warm-light focus:border-accent outline-none py-2 text-sm"
            />
          </Field>
          <Field label="Meta description">
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Por defeito usa o resumo. Máx 160 chars."
              rows={2}
              maxLength={200}
              className="w-full bg-transparent border border-warm-light focus:border-accent outline-none p-3 text-sm resize-none"
            />
          </Field>
        </div>
      </details>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-warm-light">
        <button
          type="submit"
          disabled={saving || isPending}
          className="text-xs uppercase tracking-[0.15em] border border-warm-light px-5 py-3 hover:border-ink disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar rascunho"}
        </button>
        <button
          type="button"
          onClick={() => save({ publish: true })}
          disabled={saving || isPending}
          className="btn-primary disabled:opacity-50"
        >
          <span>{post?.published ? "Atualizar (publicado)" : "Publicar agora"}</span>
        </button>
        {post?.published && (
          <button
            type="button"
            onClick={() => save({ publish: false })}
            disabled={saving || isPending}
            className="text-xs uppercase tracking-[0.15em] text-red-600 px-5 py-3 hover:bg-red-50 ml-auto"
          >
            Despublicar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-mid">
        {label}
      </span>
      {children}
    </label>
  );
}
