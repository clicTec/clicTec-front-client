export type LegalDocumentKey = 'privacy' | 'cookies' | 'legal-notice' | 'advertising';

export interface LegalDocumentLink {
  readonly label: string;
  readonly href: string;
}

export interface LegalDocumentSection {
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly items?: readonly string[];
  readonly links?: readonly LegalDocumentLink[];
  readonly note?: string;
}

export interface LegalDocument {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalDocumentSection[];
}

export interface ExternalCmpConfig {
  readonly mode: 'custom-banner' | 'external-certified';
  readonly providerName: string;
  readonly scriptUrl: string;
  readonly openPreferencesFunction: string;
}

export const siteLegalConfig = {
  brandName: 'clicTec',
  domain: 'clictec.es',
  ownerName: 'clicTec',
  contactEmail: 'legal@clictec.es',
  socialProfiles: {
    facebook: 'https://www.facebook.com/people/ClicTec/61577508058879/',
    x: 'https://x.com/clic_tec',
    instagram: 'https://www.instagram.com/clictec.es/',
    tiktok: 'https://www.tiktok.com/@clictec.es?lang=es'
  },
  consentVersion: '2026-03-26',
  consentRetentionMonths: 24,
  lastUpdated: '26 de marzo de 2026',
  googleAnalyticsId: '',
  googleAdsenseClientId: '',
  cmp: {
    mode: 'custom-banner',
    providerName: '',
    scriptUrl: '',
    openPreferencesFunction: ''
  } as ExternalCmpConfig
} as const;

const browserSettingsLinks: readonly LegalDocumentLink[] = [
  {
    label: 'Google Chrome',
    href: 'https://support.google.com/chrome/answer/95647?hl=es'
  },
  {
    label: 'Mozilla Firefox',
    href: 'https://support.mozilla.org/es/kb/Borrar%20cookies'
  },
  {
    label: 'Microsoft Edge',
    href: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09'
  },
  {
    label: 'Safari',
    href: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac'
  }
] as const;

export function getLegalDocument(documentKey: LegalDocumentKey): LegalDocument {
  const {
    brandName,
    cmp,
    contactEmail,
    consentRetentionMonths,
    domain,
    lastUpdated,
    ownerName
  } = siteLegalConfig;

  const contactLine = `Responsable del sitio web: ${ownerName}. Email de contacto: ${contactEmail}. Dominio gestionado: ${domain}.`;

  switch (documentKey) {
    case 'privacy':
      return {
        eyebrow: 'Privacidad y protección de datos',
        title: 'Política de privacidad',
        summary:
          'Esta política explica qué datos personales trata clicTec cuando navegas por la web, para qué finalidades se usan, con qué base jurídica se apoyan y cómo puedes ejercer tus derechos.',
        lastUpdated,
        sections: [
          {
            title: '1. Responsable del tratamiento',
            paragraphs: [
              contactLine,
              `Si necesitas ejercer derechos, revocar el consentimiento o plantear cualquier cuestión relacionada con privacidad, puedes escribir a ${contactEmail}.`
            ]
          },
          {
            title: '2. Datos que tratamos',
            paragraphs: [
              `En ${brandName} podemos tratar datos derivados de tu navegación para prestar el servicio y medir el funcionamiento del sitio.`
            ],
            items: [
              'Dirección IP y datos técnicos de conexión.',
              'Cookies y tecnologías similares necesarias para recordar preferencias y registrar el consentimiento.',
              'Datos de navegación, páginas visitadas, interacción con contenidos y eventos de uso si aceptas analítica.',
              'Identificadores publicitarios o de afiliación si aceptas categorías publicitarias o enlaces de afiliación medibles.'
            ]
          },
          {
            title: '3. Finalidades del tratamiento',
            items: [
              'Mostrar publicidad contextual o personalizada a través de Google AdSense, cuando proceda y exista consentimiento.',
              'Medir conversiones o atribuciones derivadas de enlaces de afiliación.',
              'Analizar tráfico, rendimiento y uso del sitio para mejorar contenidos y experiencia.',
              'Mantener la seguridad del sitio y conservar evidencias del consentimiento prestado.'
            ]
          },
          {
            title: '4. Base jurídica',
            paragraphs: [
              'Las finalidades no esenciales, como analítica, publicidad y afiliación, se apoyan en el consentimiento que prestas mediante el banner o el panel de configuración.',
              'Las tecnologías estrictamente necesarias para el funcionamiento, seguridad o registro de tus preferencias se utilizan solo en la medida imprescindible para prestar el servicio solicitado.',
              'La preferencia visual solo se conserva cuando la persona usuaria la modifica expresamente.'
            ]
          },
          {
            title: '5. Destinatarios y terceros',
            paragraphs: [
              'Tus datos pueden ser comunicados o puestos a disposición de proveedores que actúan como terceros o encargados, únicamente para las finalidades descritas.'
            ],
            items: [
              'Google, para servicios de analítica y publicidad como Google Analytics o Google AdSense, cuando se activen.',
              'Plataformas de afiliación o anunciantes con los que se integren campañas o enlaces medibles.',
              'Proveedores técnicos necesarios para alojamiento, seguridad o entrega del contenido.'
            ]
          },
          {
            title: '6. Conservación de los datos',
            paragraphs: [
              `Los registros del consentimiento y sus preferencias se conservan durante un máximo de ${consentRetentionMonths} meses, salvo que deban renovarse antes o retires el consentimiento.`,
              'Los datos asociados a analítica, publicidad o afiliación se conservarán mientras exista una finalidad válida, no revoques el consentimiento o el tercero correspondiente no agote sus propios plazos de conservación.'
            ]
          },
          {
            title: '7. Derechos de las personas usuarias',
            paragraphs: [
              'Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar el consentimiento en cualquier momento sin efectos retroactivos.'
            ],
            items: [
              `Solicita el ejercicio de derechos escribiendo a ${contactEmail}.`,
              'También puedes modificar o retirar tu consentimiento desde el panel de configuración de cookies disponible en el pie de página.',
              'Si consideras que el tratamiento no es correcto, puedes acudir a la Agencia Española de Protección de Datos.'
            ]
          },
          {
            title: '8. Actualizaciones de esta política',
            paragraphs: [
              'Podremos actualizar esta política para adaptarla a cambios legales, técnicos o de monetización. La versión vigente será siempre la publicada en esta página.'
            ]
          }
        ]
      };
    case 'cookies':
      return {
        eyebrow: 'Cookies y almacenamiento',
        title: 'Política de cookies',
        summary:
          'Esta política describe las tecnologías que usa clicTec, qué categorías existen, cómo se gestionan antes del consentimiento y cómo puedes aceptarlas, rechazarlas o configurarlas.',
        lastUpdated,
        sections: [
          {
            title: '1. Qué son las cookies y tecnologías similares',
            paragraphs: [
              'Las cookies son archivos o identificadores que un sitio web guarda en tu navegador o dispositivo. También pueden utilizarse tecnologías equivalentes, como almacenamiento local, para recordar ajustes o medir interacciones.'
            ]
          },
          {
            title: '2. Tipos de cookies que utilizamos',
            items: [
              'Técnicas o estrictamente necesarias: permiten el funcionamiento básico, recordar el modo visual elegido y conservar el estado del consentimiento.',
              'Analíticas: miden tráfico, rendimiento, navegación y uso del contenido para mejorar la web.',
              'Publicitarias: permiten gestionar espacios publicitarios, frecuencia, medición y, cuando corresponda, personalización mediante Google Ads o Google AdSense.',
              'De afiliación o medición comercial: permiten atribuir compras o conversiones cuando un usuario llega desde un enlace de afiliado.'
            ]
          },
          {
            title: '3. Cookies propias y de terceros',
            paragraphs: [
              'En clicTec usamos almacenamiento propio para preferencias técnicas y registro del consentimiento. Además, si aceptas las categorías correspondientes, podrán activarse servicios de terceros.'
            ],
            items: [
              'Google Ads y Google AdSense, para publicidad y medición publicitaria.',
              'Google Analytics, si se habilita la analítica.',
              'Plataformas de afiliación integradas en campañas o enlaces comerciales.'
            ]
          },
          {
            title: '4. Consentimiento y bloqueo previo',
            paragraphs: [
              'Las cookies analíticas, publicitarias y de afiliación permanecen bloqueadas hasta que aceptes expresamente la categoría correspondiente.',
              'El banner permite aceptar, rechazar o configurar categorías. Además, registramos la decisión tomada y la fecha para poder acreditar el consentimiento.',
              cmp.mode === 'external-certified'
                ? `La gestión del consentimiento para publicidad se apoya en ${cmp.providerName || 'una CMP certificada por Google'} cuando se utilicen integraciones publicitarias sujetas a TCF.`
                : 'Si se activa monetización con AdSense en el EEE, UK o Suiza, el consentimiento publicitario deberá gestionarse mediante una CMP certificada por Google compatible con TCF.'
            ]
          },
          {
            title: '5. Cómo configurar o retirar el consentimiento',
            paragraphs: [
              'Puedes volver a abrir el panel de configuración desde el pie de página o desde el botón disponible en esta política para aceptar, rechazar o ajustar categorías concretas.'
            ]
          },
          {
            title: '6. Cómo desactivar cookies desde el navegador',
            paragraphs: [
              'También puedes bloquear o eliminar cookies desde la configuración del navegador. Ten en cuenta que algunas funciones técnicas pueden dejar de estar disponibles.'
            ],
            links: browserSettingsLinks
          },
          {
            title: '7. Conservación',
            paragraphs: [
              `El registro local de consentimiento se conserva durante un máximo de ${consentRetentionMonths} meses. Las demás cookies y tecnologías de terceros dependerán del proveedor correspondiente y de la configuración aceptada por la persona usuaria.`
            ]
          }
        ]
      };
    case 'legal-notice':
      return {
        eyebrow: 'Información del sitio',
        title: 'Aviso legal',
        summary:
          'Este aviso regula el uso de la web clicTec y recoge la información básica del titular, el dominio, las condiciones de uso y los límites de responsabilidad sobre los contenidos publicados.',
        lastUpdated,
        sections: [
          {
            title: '1. Titular de la web',
            paragraphs: [contactLine]
          },
          {
            title: '2. Objeto y condiciones de uso',
            paragraphs: [
              `El sitio ${brandName} ofrece contenidos informativos, comparativas, guías, reviews y piezas editoriales sobre tecnología. El acceso y uso de la web implica la aceptación de este aviso legal.`,
              'La persona usuaria se compromete a hacer un uso lícito del sitio, sin realizar actividades que puedan dañar la plataforma, sus servicios o los derechos de terceros.'
            ]
          },
          {
            title: '3. Propiedad intelectual y contenidos',
            paragraphs: [
              'Los textos, diseños, marcas, gráficos y demás elementos del sitio están protegidos por la normativa aplicable. No está permitida su reproducción o reutilización sin autorización cuando sea exigible.'
            ]
          },
          {
            title: '4. Responsabilidad',
            items: [
              'El titular intenta mantener la información actualizada, pero no garantiza la ausencia absoluta de errores o interrupciones.',
              'Las opiniones, comparativas y valoraciones tienen carácter informativo y editorial.',
              'No se asume responsabilidad por el uso que terceros hagan de la información publicada ni por contenidos enlazados fuera del dominio propio.'
            ]
          },
          {
            title: '5. Enlaces externos y monetización',
            paragraphs: [
              'La web puede incluir enlaces a terceros, publicidad o enlaces de afiliación. Su presencia no implica control sobre los sitios enlazados ni sobre sus propias políticas de privacidad o cookies.'
            ]
          },
          {
            title: '6. Legislación aplicable',
            paragraphs: [
              'Este sitio se interpreta conforme a la normativa española y de la Unión Europea que resulte aplicable en materia de consumo, privacidad, propiedad intelectual y servicios de la sociedad de la información.'
            ]
          }
        ]
      };
    case 'advertising':
      return {
        eyebrow: 'Monetización y transparencia',
        title: 'Publicidad, patrocinios y afiliación',
        summary:
          'Esta página explica cómo identifica clicTec la publicidad, los contenidos patrocinados y los enlaces de afiliación para evitar confusión entre contenido editorial y contenido comercial.',
        lastUpdated,
        sections: [
          {
            title: '1. Aviso de afiliados',
            paragraphs: ['Podemos recibir comisión por compras realizadas a través de enlaces.']
          },
          {
            title: '2. Transparencia publicitaria',
            items: [
              'La publicidad display se mostrará en espacios identificables y separados del contenido editorial.',
              'No ocultaremos formatos publicitarios ni presentaremos promociones como si fueran recomendaciones neutrales sin indicarlo.',
              'Los bloques patrocinados, colaboraciones o publirreportajes se marcarán de forma visible con expresiones como “Publicidad”, “Patrocinado” o “Colaboración”.'
            ]
          },
          {
            title: '3. Criterio editorial',
            paragraphs: [
              'La existencia de monetización no elimina la obligación de claridad con la audiencia. Cuando exista una relación comercial relevante, se comunicará de forma comprensible para la persona usuaria.'
            ]
          },
          {
            title: '4. Publicidad y terceros',
            paragraphs: [
              'Si se activan servicios de Google AdSense, plataformas de afiliación u otros proveedores publicitarios, su funcionamiento quedará sujeto al consentimiento prestado en el panel de cookies y a sus propias políticas.',
              cmp.mode === 'external-certified'
                ? `Actualmente el sitio está preparado para integrarse con ${cmp.providerName || 'una CMP certificada'} como capa de gestión del consentimiento publicitario.`
                : 'Para tráfico del EEE/UK/Suiza con anuncios personalizados, deberá conectarse una CMP certificada por Google antes de activar AdSense en producción.'
            ]
          }
        ]
      };
  }
}
