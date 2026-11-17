export type Theme = 'dark' | 'light'

export const DEFAULT_THEME: Theme = 'dark'

/** Name of both the localStorage entry and the cookie that hold the visitor's theme. */
export const THEME_KEY = 'app_theme'

/** Set on `<html>` while the first theme correction runs, so colours switch without a fade. */
export const THEME_SYNC_CLASS = 'theme-sync'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

/** Attributes for the theme cookie. It carries no personal data: only `dark` or `light`. */
export const THEME_COOKIE_ATTRIBUTES = `path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`

/**
 * Runs in `<head>` before the first paint. The server has already rendered the theme
 * from the cookie; this resolves the theme the browser actually wants (saved choice,
 * else device preference), corrects the page if the two differ, and refreshes the cookie
 * so the next request is rendered correctly from the first byte.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){var m=document.cookie.match(/(?:^|; )${THEME_KEY}=(light|dark)/);t=m?m[1]:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}if(d.classList.contains('light')!==(t==='light')){d.classList.add('${THEME_SYNC_CLASS}');d.classList.toggle('light',t==='light')}document.cookie='${THEME_KEY}='+t+';${THEME_COOKIE_ATTRIBUTES}'+(location.protocol==='https:'?';secure':'')}catch(e){}})()`
