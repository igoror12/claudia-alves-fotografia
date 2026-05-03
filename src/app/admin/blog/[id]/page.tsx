import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/admin-auth";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl font-light text-ink mb-8">
        Editar post <em className="italic text-accent">— {post.title}</em>
      </h1>
      <BlogEditor post={post} />
    </div>
  );
}
