export const siteConfig = {
  name: 'signQA',
  tagline: 'Trusted sign language answers, delivered in seconds.',
  description:
    'signQA delivers authoritative, accessible answers about sign language so every interaction can be inclusive and confident.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.signqa.dev',
  social: {
    twitter: 'https://twitter.com/signqa',
    github: 'https://github.com/signqa',
    linkedin: 'https://www.linkedin.com/company/signqa'
  },
  plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'signqa.dev',
  contactEmail: 'hello@signqa.dev',
  keywords: [
    'sign language',
    'accessibility',
    'inclusive communication',
    'ASL resources',
    'sign language answers'
  ]
};

export type SiteConfig = typeof siteConfig;
