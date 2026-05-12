"use client";

import { useState } from "react";
import Image from "next/image";

type Service = {
  num: string;
  name: string;
  desc: string;
  price: string;
  img: string;
  objectPosition: string;
};

type Preview = {
  x: number;
  y: number;
  src: string;
  objectPosition: string;
};

const SERVICES: Service[] = [
  {
    num: "01",
    name: "Retratos",
    desc: "Sessões individuais, familiares e editoriais. Estúdio ou exterior.",
    price: "desde 220€",
    img: "/images/claudia.jpg",
    objectPosition: "50% 35%",
  },
  {
    num: "02",
    name: "Casamentos",
    desc: "Reportagem natural do dia inteiro. Duas máquinas, sem poses.",
    price: "desde 1.450€",
    img: "/images/claudia.jpg",
    objectPosition: "50% 45%",
  },
  {
    num: "03",
    name: "Eventos",
    desc: "Batizados, festas privadas, lançamentos. Cobertura discreta.",
    price: "desde 380€",
    img: "/images/claudia.jpg",
    objectPosition: "50% 55%",
  },
  {
    num: "04",
    name: "Editorial",
    desc: "Marcas, espaços, produto. Direção de arte incluída.",
    price: "sob consulta",
    img: "/images/claudia.jpg",
    objectPosition: "50% 65%",
  },
];

export function Services() {
  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <section className="services-editorial px-6 py-20 sm:px-12 sm:py-28" id="services">
      <div className="mx-auto max-w-5xl">
        <header className="reveal grid md:grid-cols-12 gap-6 mb-12 sm:mb-16">
          <div className="md:col-span-7">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] text-accent mb-3">
              — Serviços
            </p>
            <h2 className="font-serif text-[2.8rem] sm:text-[3.5rem] font-light leading-[1.05] text-ink">
              Quatro formas de
              <br />
              <em className="italic text-warm-mid">trabalharmos juntos.</em>
            </h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-[0.85rem] leading-[1.8] text-warm-mid md:pt-7">
            Cada sessão começa com uma chamada. Quero perceber o que queres
            lembrar antes de pensar em como fotografar.
          </p>
        </header>

        <div className="services-list reveal">
          {SERVICES.map((service) => (
            <ServiceLink
              key={service.num}
              service={service}
              onPreview={setPreview}
            />
          ))}
        </div>

        {preview && (
          <div
            className="service-preview visible"
            aria-hidden="true"
            style={{ left: preview.x + 40, top: preview.y - 170 }}
          >
            <Image
              src={preview.src}
              alt=""
              fill
              sizes="260px"
              className="object-cover"
              style={{ objectPosition: preview.objectPosition }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ServiceLink({
  service,
  onPreview,
}: {
  service: Service;
  onPreview: (preview: Preview | null) => void;
}) {
  const [firstName, ...restName] = service.name.split(" ");
  const [priceLead, ...priceRest] = service.price.split(" ");

  return (
    <a
      href="#contact"
      className="service"
      onMouseMove={(event) =>
        onPreview({
          x: event.clientX,
          y: event.clientY,
          src: service.img,
          objectPosition: service.objectPosition,
        })
      }
      onMouseLeave={() => onPreview(null)}
      onFocus={() => onPreview(null)}
      aria-label={`${service.name} — ${service.price}`}
    >
      <span className="service-num">{service.num}</span>
      <span className="service-name">
        {firstName}
        {restName.length > 0 && <em> {restName.join(" ")}</em>}
      </span>
      <span className="service-desc">{service.desc}</span>
      <span className="price">
        {priceLead}
        {priceRest.length > 0 && <em> {priceRest.join(" ")}</em>}
      </span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
