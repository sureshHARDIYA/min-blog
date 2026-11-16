import type { Language } from '../../i18n/translations'
import copy from './copy.json'

export type HomeCopy = (typeof copy)['en']

/** Home page text per language. Edit the wording in `copy.json`. */
export const HOME_COPY: Record<Language, HomeCopy> = copy
