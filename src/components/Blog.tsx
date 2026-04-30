import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@prisma/client";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDate(d: Date | null) {
  if (!d) return "";
  return `${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

export function Blog({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="px-12 py-24 bg-[#F4F0EA]" id="blog">
      <header className="reveal mb-12">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Reflexões & histórias
        </p>
        <h2 className="font-serif text-[2.8rem] font-light leading-[1.1]">
          Do meu
          <br />
          <em className="italic text-warm-mid">diário visual</em>
        </h2>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {posts.length === 0 && (
          <div className="md:col-span-3 text-center text-warm-mid py-8">
            Em breve, novas histórias do diário visual.
          </div>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="blog-card reveal block"
          >
            <div className="aspect-[3/2] overflow-hidden mb-5 relative bg-warm-light">
              {post.coverUrl ? (
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="blog-thumb-img object-cover"
                />
              ) : null}
            </div>
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-accent mb-2">
              {post.category}
            </div>
            <h3 className="blog-title font-serif text-[1.4rem] font-light leading-[1.3] mb-3 text-ink">
              {post.title}
            </h3>
            <p className="text-[0.82rem] leading-[1.7] text-warm-mid mb-4">
              {post.excerpt}
            </p>
            <div className="text-xs uppercase tracking-[0.1em] text-warm-light">
              {formatDate(post.publishedAt)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
