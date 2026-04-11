export interface ReviewHeroImageStyle {
  widthPct?: number;
  maxWidthPct?: number;
  maxHeightPct?: number;
  translateXPct?: number;
  translateYPct?: number;
}

const DEFAULT_REVIEW_HERO_IMAGE_STYLE: Required<ReviewHeroImageStyle> = {
  widthPct: 72,
  maxWidthPct: 76,
  maxHeightPct: 74,
  translateXPct: 0,
  translateYPct: 0
};

const REVIEW_HERO_IMAGE_STYLES: Record<string, ReviewHeroImageStyle> = {
  'google-pixel-10-pro': {
    widthPct: 58,
    maxWidthPct: 64,
    maxHeightPct: 66,
    translateYPct: -4
  },
  'iphone-17': {
    widthPct: 60,
    maxWidthPct: 66,
    maxHeightPct: 68,
    translateYPct: -8
  }
};

export function getReviewHeroImageStyle(slug: string | null | undefined): Required<ReviewHeroImageStyle> {
  return {
    ...DEFAULT_REVIEW_HERO_IMAGE_STYLE,
    ...(slug ? REVIEW_HERO_IMAGE_STYLES[slug] : {})
  };
}
