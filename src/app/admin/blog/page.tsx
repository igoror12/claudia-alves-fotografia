import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { BlogList } from "@/components/admin/BlogList";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdminPage();

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ published: "asc" }, { updatedAt: "desc" }],
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-light text-ink mb-2">
            Blog <em className="italic text-accent">— posts e artigos</em>
          </h1>
          <p className="text-sm text-warm-mid">
            {posts.length} post{posts.length === 1 ? "" : "s"} ·{" "}
            {posts.filter((p) => p.published).length} publicado
            {posts.filter((p) => p.published).length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">
          <span>+ Novo post</span>
        </Link>
      </header>

      <BlogList posts={posts} />
    </div>
  );
}
