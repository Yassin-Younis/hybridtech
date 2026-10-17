// Downloadable PDF brochures per language, rendered by brochures/build.mjs into public/brochures/.
export const brochures = {
  company: {
    en: { file: 'brochures/hybrid-technology-company-profile.pdf', name: 'Hybrid-Technology-Company-Profile.pdf' },
    ar: { file: 'brochures/hybrid-technology-company-profile-ar.pdf', name: 'Hybrid-Technology-Company-Profile-AR.pdf' },
  },
  software: {
    en: { file: 'brochures/hybrid-technology-software.pdf', name: 'Hybrid-Technology-Software-Development.pdf' },
    ar: { file: 'brochures/hybrid-technology-software-ar.pdf', name: 'Hybrid-Technology-Software-Development-AR.pdf' },
  },
} as const;
