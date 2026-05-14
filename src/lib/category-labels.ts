type CategoryLike = {
  name: string;
  slug?: string;
};

export function getCategoryLabel(category: CategoryLike) {
  const key = category.slug ?? category.name.toLowerCase();
  return key === "casamentos" ? "Branding" : category.name;
}
