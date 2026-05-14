import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Cursor } from "@/components/Cursor";
import { Reveal } from "@/components/Reveal";

export const revalidate = 600;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://claudialvesfotografia.pt";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDate(d: Date | null) {
  if (!d) return "";
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost
    .findUnique({ where: { slug: params.slug, published: true } })
    .catch(() => null);
  if (!post) return { title: "Post não encontrado" };

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDesc ?? post.excerpt,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDesc ?? post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverUrl ? { images: [{ url: post.coverUrl }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost
    .findUnique({
      where: { slug: params.slug, published: true },
      include: { author: { select: { name: true } } },
    })
    .catch(() => null);

  if (!post) notFound();

  const rawContentHtml = await marked(post.content, { async: false });
  const contentHtml = DOMPurify.sanitize(rawContentHtml);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name ?? "Cláudia Alves",
    },
    publisher: {
      "@type": "Organization",
      name: "Cláudia Alves Fotografia",
      url: siteUrl,
    },
    ...(post.coverUrl ? { image: post.coverUrl } : {}),
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <Cursor />
      <Reveal />
      <Nav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        {/* Cover */}
        {post.coverUrl && (
          <div className="w-full h-[55vh] sm:h-[65vh] relative overflow-hidden">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
          </div>
        )}

        <div className="px-6 sm:px-12 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Back + meta */}
            <div className="mb-10 reveal">
              <Link
                href="/blog"
                className="text-[0.7rem] uppercase tracking-[0.2em] text-warm-mid hover:text-ink transition-colors inline-flex items-center gap-2 mb-8"
              >
                <span>←</span> Blog
              </Link>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent mb-3">
                {post.category}
              </p>
              <h1 className="font-serif text-[2.6rem] sm:text-[3.2rem] font-light leading-[1.1] text-ink mb-4">
                {post.title}
              </h1>
              <p className="text-[0.82rem] leading-[1.7] text-warm-mid mb-6 max-w-xl">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-warm-light border-t border-warm-light/50 pt-6">
                <span>{post.author.name ?? "Cláudia Alves"}</span>
                <span>·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>

            {/* Content */}
            <article
              className="blog-content reveal"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Footer nav */}
            <div className="mt-16 pt-8 border-t border-warm-light/50 reveal">
              <Link href="/blog" className="btn-link">
                <span>←</span> Todos os artigos
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
