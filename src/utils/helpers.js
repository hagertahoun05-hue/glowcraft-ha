export const SKIN_TYPES = [
  { key: 'oily', en: 'Oily', ar: 'دهنية' },
  { key: 'dry', en: 'Dry', ar: 'جافة' },
  { key: 'combination', en: 'Combination', ar: 'مختلطة' },
  { key: 'sensitive', en: 'Sensitive', ar: 'حساسة' },
]

export const CONCERNS = [
  { key: 'acne', en: 'Acne', ar: 'حب الشباب' },
  { key: 'dark-spots', en: 'Dark spots', ar: 'البقع الداكنة' },
  { key: 'dryness', en: 'Dryness', ar: 'الجفاف' },
  { key: 'aging', en: 'Fine lines', ar: 'الخطوط الدقيقة' },
  { key: 'dullness', en: 'Dullness', ar: 'بهتان البشرة' },
  { key: 'sensitivity', en: 'Sensitivity', ar: 'الحساسية' },
]

export const FREE_SHIPPING_FROM = 50
export const SHIPPING_FEE = 4.99

export const finalPrice = (p) =>
  p.discount ? Math.round(p.price * (1 - p.discount / 100) * 100) / 100 : p.price

export const money = (n) => `$${Number(n).toFixed(2)}`

export const calcTotals = (items) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  return { subtotal, shipping, total: subtotal + shipping }
}

export const labelOf = (list, key, lang) => {
  const f = list.find((x) => x.key === key)
  return f ? (lang === 'ar' ? f.ar : f.en) : key
}

export const addMonths = (dateStr, months) => {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d
}

export const daysLeft = (date) => Math.ceil((date - new Date()) / 86400000)

export const formatDate = (date, lang) =>
  new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const today = () => new Date().toISOString().slice(0, 10)

// ---------- validators ----------
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
export const isPhone = (v) => /^01[0125]\d{8}$/.test(v.trim())
