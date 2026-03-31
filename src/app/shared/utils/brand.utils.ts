export interface BrandLink {
  name: string;
  slug: string;
  route: string;
  logoPath: string;
}

const RECOMMENDED_BRAND_ORDER = ['apple', 'google', 'oppo', 'samsung', 'vivo', 'xiaomi'] as const;

export function slugifyBrand(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mapRecommendedBrands(availableBrands: readonly string[]): BrandLink[] {
  const brandsBySlug = new Map(availableBrands.map((brand) => [slugifyBrand(brand), brand]));

  return RECOMMENDED_BRAND_ORDER.flatMap((slug) => {
    const brandName = brandsBySlug.get(slug);
    if (!brandName) {
      return [];
    }

    return [
      {
        name: brandName,
        slug,
        route: `/marcas/${slug}`,
        logoPath: `/brand-logos/${slug}.svg`
      }
    ];
  });
}

export function resolveBrandNameFromSlug(slug: string, availableBrands: readonly string[]): string | null {
  const normalizedSlug = slugifyBrand(slug);

  return availableBrands.find((brand) => slugifyBrand(brand) === normalizedSlug) ?? null;
}
