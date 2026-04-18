import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = normalizeBaseUrl(process.env.SITE_URL || 'https://clictec.es');
const API_BASE = normalizeBaseUrl(process.env.SITEMAP_API_BASE || 'http://localhost:8080');
const OUTPUT_PATH = resolve(__dirname, '../public/sitemap.xml');
const LASTMOD = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/moviles', changefreq: 'daily', priority: '0.9' },
  { path: '/comparativas', changefreq: 'weekly', priority: '0.8' },
  { path: '/guias', changefreq: 'weekly', priority: '0.7' },
  { path: '/ranking', changefreq: 'weekly', priority: '0.7' },
  { path: '/privacidad', changefreq: 'monthly', priority: '0.4' },
  { path: '/cookies', changefreq: 'monthly', priority: '0.4' },
  { path: '/aviso-legal', changefreq: 'monthly', priority: '0.3' },
  { path: '/publicidad-afiliacion', changefreq: 'monthly', priority: '0.3' }
];

async function main() {
  const { mobiles, brandSlugs } = await fetchCatalogData();

  const urls = [
    ...STATIC_ROUTES.map((route) => toUrlEntry(route)),
    ...brandSlugs.map((brandSlug) =>
      toUrlEntry({
        path: `/marcas/${brandSlug}`,
        changefreq: 'weekly',
        priority: '0.7'
      })
    ),
    ...mobiles.map((mobile) =>
      toUrlEntry({
        path: `/moviles/${mobile.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        imageUrl: mobile.image,
        imageTitle: `${mobile.brand} ${mobile.model}`.trim()
      })
    )
  ];

  const sitemapXml = renderSitemap(urls);
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, sitemapXml, 'utf8');

  console.log(`Sitemap generado en ${OUTPUT_PATH} con ${urls.length} URLs.`);
}

async function fetchCatalogData() {
  const size = 100;
  const allItems = [];
  let currentPage = 1;
  let totalPages = 1;
  let brandOptions = [];

  do {
    const payload = await fetchJson(`/api/moviles?page=${currentPage}&size=${size}`);
    const catalog = payload.catalog ?? {};
    const items = Array.isArray(catalog.items) ? catalog.items : [];
    allItems.push(...items);
    totalPages = Number(catalog.totalPages ?? 1) || 1;

    if (currentPage === 1) {
      const filterGroups = Array.isArray(payload.filterGroups) ? payload.filterGroups : [];
      brandOptions =
        filterGroups.find((group) => group.key === 'brand')?.options?.filter(Boolean).map(slugifyBrand) ?? [];
    }

    currentPage += 1;
  } while (currentPage <= totalPages);

  const mobiles = Array.from(
    new Map(
      allItems
        .filter((item) => item?.slug)
        .map((item) => [
          item.slug,
          {
            slug: String(item.slug),
            brand: String(item.brand ?? ''),
            model: String(item.model ?? ''),
            image: typeof item.image === 'string' ? item.image : ''
          }
        ])
    ).values()
  ).sort((left, right) => left.slug.localeCompare(right.slug, 'es'));

  const brandSlugs = Array.from(new Set(brandOptions)).sort((left, right) => left.localeCompare(right, 'es'));

  return { mobiles, brandSlugs };
}

async function fetchJson(path) {
  const url = new URL(path, `${API_BASE}/`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo obtener ${url.toString()} (${response.status} ${response.statusText})`);
  }

  return response.json();
}

function toUrlEntry({ path, changefreq, priority, imageUrl = '', imageTitle = '' }) {
  return {
    loc: resolveUrl(path),
    lastmod: LASTMOD,
    changefreq,
    priority,
    imageLoc: imageUrl ? resolveUrl(imageUrl) : '',
    imageTitle
  };
}

function renderSitemap(urls) {
  const body = urls
    .map((url) => {
      const imageNode = url.imageLoc
        ? [
            '    <image:image>',
            `      <image:loc>${escapeXml(url.imageLoc)}</image:loc>`,
            `      <image:title>${escapeXml(url.imageTitle)}</image:title>`,
            '    </image:image>'
          ].join('\n')
        : '';

      return [
        '  <url>',
        `    <loc>${escapeXml(url.loc)}</loc>`,
        `    <lastmod>${url.lastmod}</lastmod>`,
        `    <changefreq>${url.changefreq}</changefreq>`,
        `    <priority>${url.priority}</priority>`,
        imageNode,
        '  </url>'
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    body,
    '</urlset>',
    ''
  ].join('\n');
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '');
}

function resolveUrl(path) {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${SITE_URL}/`).toString();
}

function slugifyBrand(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

main().catch((error) => {
  console.error(`Error al generar el sitemap: ${error.message}`);
  process.exitCode = 1;
});
