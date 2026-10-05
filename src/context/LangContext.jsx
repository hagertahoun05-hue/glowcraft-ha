import { createContext, useContext, useEffect, useState } from 'react'

const LangContext = createContext(null)

/*
  How to translate anything:
    t('Add to cart', 'أضف إلى السلة')       -> plain text
    pick(product, 'name')                   -> product.nameAr in Arabic, product.name in English
*/
export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('lang', lang)
  }, [lang])

  const toggleLang = () => setLang((l) => (l === 'en' ? 'ar' : 'en'))
  const t = (en, ar) => (lang === 'ar' && ar ? ar : en)
  const pick = (obj, field) => {
    if (!obj) return ''
    const ar = obj[`${field}Ar`]
    const hasAr = Array.isArray(ar) ? ar.length > 0 : Boolean(ar)
    return lang === 'ar' && hasAr ? ar : obj[field]
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, pick }}>{children}</LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
