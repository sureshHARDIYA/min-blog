export interface FooterLink {
  readonly label: string
  readonly href: string
  /** External links open in a new tab and show the ↗ icon. */
  readonly isExternal: boolean
}

/**
 * Links shown under the "Networks" heading in the site footer.
 * To add a link, append an entry here — order is display order.
 */
export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/sureshHARDIYA', isExternal: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sureshhardiya/', isExternal: true },
  { label: 'YouTube', href: 'https://www.youtube.com/@SureshKUMARMukhiya', isExternal: true },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?hl=en&view_op=list_works&gmla=AO4B3jvPGtKOD6tjKzHR0aCqvorVLxPTdXJDM7pAW7KaOMZPxdpE4NGA-i2H_e94T1bRGO8BV4X3AilXRUBb-1RQoXbl&user=9-fxxeMAAAAJ',
    isExternal: true,
  },
  { label: 'PhD Resources', href: 'https://github.com/sureshHARDIYA/phd-resources', isExternal: true },
  { label: 'Revios', href: 'https://revios.no/', isExternal: true },
  { label: 'Vulnerability Intelligence', href: '/vulnerabilities', isExternal: false },
  { label: 'Security Notice Alert', href: 'https://sureshhardiya.github.io/vulnintel/', isExternal: true },
]
