"use client";

import { useState } from "react";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus("ok");
      e.currentTarget.reset();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Não foi possível enviar a mensagem.");
      setStatus("error");
    }
  }

  return (
    <section className="parallax-bg px-6 py-20 sm:px-12 sm:py-24 grid md:grid-cols-2 gap-12 md:gap-24" id="contact">
      <div className="reveal">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Contacto
        </p>
        <h2 className="font-serif text-[2.8rem] font-light leading-[1.1]">
          Vamos criar
          <br />
          <em className="italic text-warm-mid">algo juntos?</em>
        </h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-12">
          {/* Honeypot — escondido a humanos, preenchido por bots.
              Lê-se em /api/contact e descarta silenciosamente. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] w-px h-px opacity-0"
          />
          <Field name="name" label="Nome" placeholder="O teu nome" required />
          <Field name="email" type="email" label="Email" placeholder="teu@email.com" required />
          <Field name="sessionType" label="Tipo de sessão" placeholder="Casamento, retrato, evento..." required />
          <Field name="desiredDate" label="Data pretendida" placeholder="Ex: Setembro 2026" />

          <div className="flex flex-col gap-2">
            <label className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-mid">
              Mensagem
            </label>
            <textarea
              name="message"
              required
              placeholder="Conta-me um pouco sobre o teu projeto..."
              className="bg-transparent border-0 border-b border-warm-light focus:border-accent outline-none py-3 text-sm h-24 resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary self-start disabled:opacity-50 disabled:cursor-wait"
          >
            <span>
              {status === "sending" ? "A enviar..." : "Enviar mensagem →"}
            </span>
          </button>

          {status === "ok" && (
            <p className="text-sm text-accent">
              Mensagem enviada. Respondo em até 24 horas. Obrigada!
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>

      <aside className="reveal mt-12">
        <h3 className="font-serif text-[2rem] font-light italic text-ink mb-6 leading-[1.25]">
          Cada história merece ser contada com cuidado e atenção
        </h3>
        <p className="text-sm leading-[1.9] text-warm-mid mb-10">
          Respondo a todas as mensagens em até 24 horas. Para casamentos e
          datas específicas, recomendo entrar em contacto com pelo menos 3
          meses de antecedência — as minhas disponibilidades preenchem-se
          rapidamente, especialmente na primavera e no verão.
        </p>
        <div className="flex flex-col gap-4">
          <Detail label="Email" value="claudialvesfotografia@gmail.com" />
          <Detail label="Telefone" value="+351 938 944 545" />
          <Detail label="Localização" value="Braga, Portugal" />
          <Detail label="Instagram" value="@claudialvesfotografia" />
        </div>
      </aside>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[0.65rem] uppercase tracking-[0.2em] text-warm-mid">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="bg-transparent border-0 border-b border-warm-light focus:border-accent outline-none py-3 text-sm transition-colors"
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 items-center text-sm">
      <span className="text-[0.65rem] uppercase tracking-[0.15em] text-accent min-w-[80px]">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
