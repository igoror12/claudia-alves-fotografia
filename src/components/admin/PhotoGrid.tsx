"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Photo, Category } from "@prisma/client";

type PhotoWithCategory = Photo & { category: Category };

type Props = {
  photos: PhotoWithCategory[];
};

export function PhotoGrid({ photos }: Props) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-warm-mid italic">
        Ainda não há fotografias publicadas. Arrasta para o uploader acima.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((p) => (
        <PhotoCard key={p.id} photo={p} />
      ))}
    </ul>
  );
}

function PhotoCard({ photo }: { photo: PhotoWithCategory }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const aspect = photo.height > 0 ? photo.width / photo.height : 1;

  async function patch(data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(`Erro: ${j.error ?? res.status}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (
      !confirm(
        `Remover "${photo.title ?? photo.altText}"? Esta acção apaga também os ficheiros do Blob e é irreversível.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Erro ao remover.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <li className="border border-warm-light bg-white group relative">
      <div
        className="relative bg-warm-light/30"
        style={{ aspectRatio: aspect.toString() }}
      >
        <Image
          src={photo.thumbUrl}
          alt={photo.altText}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={`object-cover transition-opacity ${
            photo.published ? "" : "opacity-40"
          }`}
          placeholder="blur"
          blurDataURL={photo.blurDataUrl}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] bg-ink/80 text-cream px-2 py-1">
            {photo.category.name}
          </span>
          {photo.featured && (
            <span className="text-[0.6rem] uppercase tracking-[0.15em] bg-accent text-white px-2 py-1">
              Destaque
            </span>
          )}
          {!photo.published && (
            <span className="text-[0.6rem] uppercase tracking-[0.15em] bg-red-600 text-white px-2 py-1">
              Rascunho
            </span>
          )}
        </div>
      </div>

      <div className="p-3 text-xs">
        {editing ? (
          <EditForm
            photo={photo}
            onSave={async (data) => {
              await patch(data);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            disabled={isPending}
          />
        ) : (
          <>
            <p className="font-serif text-sm text-ink truncate" title={photo.title ?? photo.altText}>
              {photo.title ?? photo.altText}
            </p>
            <p className="text-warm-mid mt-0.5 line-clamp-2 leading-relaxed">
              {photo.altText}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="text-[0.65rem] uppercase tracking-[0.15em] hover:text-accent"
                onClick={() => setEditing(true)}
                disabled={isPending}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-[0.65rem] uppercase tracking-[0.15em] hover:text-accent"
                onClick={() => patch({ featured: !photo.featured })}
                disabled={isPending}
              >
                {photo.featured ? "Tirar destaque" : "Destacar"}
              </button>
              <button
                type="button"
                className="text-[0.65rem] uppercase tracking-[0.15em] hover:text-accent"
                onClick={() => patch({ published: !photo.published })}
                disabled={isPending}
              >
                {photo.published ? "Despublicar" : "Publicar"}
              </button>
              <button
                type="button"
                className="text-[0.65rem] uppercase tracking-[0.15em] text-red-600 hover:opacity-70 ml-auto"
                onClick={remove}
                disabled={isPending}
              >
                Remover
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function EditForm({
  photo,
  onSave,
  onCancel,
  disabled,
}: {
  photo: PhotoWithCategory;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [title, setTitle] = useState(photo.title ?? "");
  const [altText, setAltText] = useState(photo.altText);
  const [order, setOrder] = useState<number>(photo.order);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ title: title || null, altText, order });
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="uppercase tracking-[0.15em] text-warm-mid text-[0.6rem]">Título</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-warm-light px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="uppercase tracking-[0.15em] text-warm-mid text-[0.6rem]">Alt text</span>
        <textarea
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          rows={2}
          className="border border-warm-light px-2 py-1 resize-none"
          required
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="uppercase tracking-[0.15em] text-warm-mid text-[0.6rem]">Ordem</span>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="border border-warm-light px-2 py-1 w-20"
        />
      </label>
      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={disabled}
          className="text-[0.65rem] uppercase tracking-[0.15em] bg-ink text-cream px-3 py-1 disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="text-[0.65rem] uppercase tracking-[0.15em]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
