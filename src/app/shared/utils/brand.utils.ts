export interface BrandLink {
  name: string;
  slug: string;
  route: string;
  logoPath: string;
}

const FEATURED_BRANDS = [
  { name: 'Apple', slug: 'apple' },
  { name: 'Google', slug: 'google' },
  { name: 'Oppo', slug: 'oppo' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Vivo', slug: 'vivo' },
  { name: 'Xiaomi', slug: 'xiaomi' }
] as const;

export function slugifyBrand(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mapRecommendedBrands(availableBrands: readonly string[] = []): BrandLink[] {
  const brandsBySlug = new Map(availableBrands.map((brand) => [slugifyBrand(brand), brand]));

  return FEATURED_BRANDS.map(({ name, slug }) => ({
    name: brandsBySlug.get(slug) ?? name,
    slug,
    route: `/marcas/${slug}`,
    logoPath: `/brand-logos/${slug}.svg`
  }));
}

export function resolveBrandNameFromSlug(slug: string, availableBrands: readonly string[]): string | null {
  const normalizedSlug = slugifyBrand(slug);

  return (
    availableBrands.find((brand) => slugifyBrand(brand) === normalizedSlug) ??
    FEATURED_BRANDS.find((brand) => brand.slug === normalizedSlug)?.name ??
    null
  );
}
