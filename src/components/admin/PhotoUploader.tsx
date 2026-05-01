"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";

type Props = { categories: Category[] };

type UploadJob = {
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  message?: string;
  warning?: string;
};

export function PhotoUploader({ categories }: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [autoMeta, setAutoMeta] = useState(true);

  const onDrop = useCallback((files: File[]) => {
    setJobs((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, status: "queued" as const })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/tiff": [".tif", ".tiff"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  async function processQueue() {
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status !== "queued") continue;
      setJobs((prev) =>
        prev.map((j, idx) => (idx === i ? { ...j, status: "uploading" } : j))
      );

      const fd = new FormData();
      fd.append("file", jobs[i].file);
      if (categoryId) fd.append("categoryId", categoryId);
      // Se autoMeta off, mandamos altText vazio para forçar o admin a editar depois
      if (!autoMeta) fd.append("altText", "Por preencher");

      try {
        const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        setJobs((prev) =>
          prev.map((job, idx) =>
            idx === i
              ? { ...job, status: "done", warning: j.warning ?? undefined }
              : job
          )
        );
      } catch (e) {
        setJobs((prev) =>
          prev.map((job, idx) =>
            idx === i
              ? { ...job, status: "error", message: (e as Error).message }
              : job
          )
        );
      }
    }
    router.refresh();
  }

  const queued = jobs.filter((j) => j.status === "queued").length;
  const uploading = jobs.some((j) => j.status === "uploading");

  return (
    <section className="border border-warm-light bg-white p-8">
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="text-xs flex flex-col gap-1">
          <span className="uppercase tracking-[0.15em] text-warm-mid">
            Categoria (opcional, IA detecta)
          </span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-warm-light px-3 py-2 bg-transparent text-sm"
          >
            <option value="">Auto (Claude)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs flex items-center gap-2 self-end">
          <input
            type="checkbox"
            checked={autoMeta}
            onChange={(e) => setAutoMeta(e.target.checked)}
          />
          <span className="uppercase tracking-[0.15em] text-warm-mid">
            Gerar alt-text + SEO automaticamente (Claude)
          </span>
        </label>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-accent bg-accent/5" : "border-warm-light"
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-serif text-2xl font-light text-ink mb-2">
          {isDragActive ? "Largar aqui" : "Arrasta fotografias para aqui"}
        </p>
        <p className="text-xs uppercase tracking-[0.15em] text-warm-mid">
          ou clica para escolher · JPG, PNG, WebP, TIFF · até 25MB
        </p>
      </div>

      {jobs.length > 0 && (
        <div className="mt-6">
          <ul className="text-sm space-y-2 mb-4">
            {jobs.map((j, i) => (
              <li key={i} className="border-b border-warm-light/50 py-2">
                <div className="flex justify-between items-center">
                  <span className="truncate flex-1">{j.file.name}</span>
                  <span className="ml-4 text-xs uppercase tracking-[0.1em] flex-shrink-0">
                    {j.status === "done" && (
                      <span className="text-accent">✓ enviado</span>
                    )}
                    {j.status === "uploading" && (
                      <span className="text-warm-mid">a enviar...</span>
                    )}
                    {j.status === "queued" && (
                      <span className="text-warm-mid">na fila</span>
                    )}
                    {j.status === "error" && (
                      <span className="text-red-600">✕ erro</span>
                    )}
                  </span>
                </div>
                {j.status === "error" && j.message && (
                  <p className="text-xs text-red-600 mt-1 leading-relaxed normal-case tracking-normal">
                    {j.message}
                  </p>
                )}
                {j.status === "done" && j.warning && (
                  <p className="text-xs text-warm-mid italic mt-1 leading-relaxed normal-case tracking-normal">
                    Aviso: {j.warning}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={processQueue}
            disabled={uploading || queued === 0}
            className="btn-primary disabled:opacity-50"
          >
            <span>
              {uploading
                ? "A processar..."
                : queued === 0
                  ? "Tudo enviado"
                  : `Iniciar upload (${queued})`}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
