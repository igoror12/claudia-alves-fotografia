import { requireAdminPage } from "@/lib/admin-auth";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  await requireAdminPage();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-serif text-4xl font-light text-ink mb-8">
        Novo post <em className="italic text-accent">— rascunho</em>
      </h1>
      <BlogEditor />
    </div>
  );
}
