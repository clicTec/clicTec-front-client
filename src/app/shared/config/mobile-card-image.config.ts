export type MobileImageStyle = Readonly<Record<string, string>>;

export interface MobileImageOverride {
  src?: string;
  frameStyle?: MobileImageStyle;
  imageStyle?: MobileImageStyle;
}

export const MOVILES_HERO_IMAGE: Readonly<MobileImageOverride & { src: string }> = {
  src: '/mobile-images/google-pixel-10-pro.png'
};

export const MOBILE_CARD_IMAGE_OVERRIDES: Readonly<Record<string, MobileImageOverride>> = {
  'oppo-find-x9-pro': {
    frameStyle: {
      background: 'transparent',
      paddingTop: '1.1rem',
      paddingBottom: '0.85rem'
    },
    imageStyle: {
      width: 'auto',
      height: '6.75rem',
      maxWidth: '100%',
      maxHeight: '100%',
      transform: 'translateY(0.08rem) scale(0.98)',
      transformOrigin: 'center center',
      objectPosition: 'center center'
    }
  },
  'iphone-17-pro-max': {
    frameStyle: {
      background: 'transparent',
      paddingTop: '1.05rem',
      paddingBottom: '0.85rem'
    },
    imageStyle: {
      width: 'auto',
      height: '6.25rem',
      maxWidth: '100%',
      maxHeight: '100%',
      transform: 'translateY(0.1rem) scale(0.92)',
      transformOrigin: 'center center',
      objectPosition: 'center center'
    }
  },
  'samsung-s26-ultra': {
    src: '/mobile-images/samsung-s26-ultra-card.png',
    frameStyle: {
      background: 'transparent',
      paddingTop: '1.15rem',
      paddingBottom: '0.9rem'
    },
    imageStyle: {
      width: 'auto',
      height: '6.9rem',
      maxWidth: '100%',
      maxHeight: '100%',
      transform: 'translateY(0.08rem) scale(0.98)',
      transformOrigin: 'center center',
      objectPosition: 'center center'
    }
  },
  'xiaomi-17-ultra': {
    src: '/mobile-images/xiaomi-17-ultra-transparent.png',
    frameStyle: {
      background: 'transparent',
      paddingTop: '1.15rem',
      paddingBottom: '0.9rem'
    },
    imageStyle: {
      width: 'auto',
      height: '6.05rem',
      maxWidth: '100%',
      maxHeight: '100%',
      transform: 'translateY(0.2rem) scale(0.88)',
      transformOrigin: 'center center',
      objectPosition: 'center center'
    }
  }
};
