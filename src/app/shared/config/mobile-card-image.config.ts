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
  // Ajusta cada móvil por slug.
  // Ejemplo:
  // 'iphone-16-pro': {
  //   src: '/mobile-images/iphone-16-pro.png',
  //   frameStyle: {
  //     paddingTop: '1.35rem'
  //   },
  //   imageStyle: {
  //     transform: 'translateY(0.35rem) scale(1.06)',
  //     objectPosition: 'center top'
  //   }
  // }
};
