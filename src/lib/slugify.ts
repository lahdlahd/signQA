export const slugify = (input: string) => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export async function createUniqueSlug(
  title: string,
  existingSlugs: Set<string>
): Promise<string> {
  const base = slugify(title);
  if (!existingSlugs.has(base)) {
    return base;
  }

  let counter = 2;
  let slug = `${base}-${counter}`;
  while (existingSlugs.has(slug)) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}
