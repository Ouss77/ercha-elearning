/**
 * Generate a URL-friendly slug from a string using initials
 * @param text - The text to convert to a slug
 * @returns A short URL-friendly slug made from initials
 */
export function generateSlug(text: string): string {
  // Normalize and clean the text
  const normalized = text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Split into words and filter out common words/articles
  const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'a', 'et', 'pour', 'avec', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at'];
  const words = normalized
    .split(/[^a-z0-9]+/)
    .filter(word => word.length > 0 && !commonWords.includes(word));
  
  // If only one word and it's short, use it as is (max 6 chars)
  if (words.length === 1 && words[0].length <= 6) {
    return words[0];
  }
  
  // Generate initials from meaningful words
  const initials = words
    .map(word => word[0])
    .join('');
  
  return initials;
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
