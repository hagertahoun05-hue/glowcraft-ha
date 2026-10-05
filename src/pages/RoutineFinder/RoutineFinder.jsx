import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ProductImage from '../../components/ProductImage'
import { useLang } from '../../context/LangContext'
import { useShop } from '../../context/ShopContext'
import { CONCERNS, SKIN_TYPES, finalPrice, labelOf, money } from '../../utils/helpers'
import './RoutineFinder.css'

const STEPS = [
  { cat: 'cleansers', en: 'Cleanse', ar: 'التنظيف' },
  { cat: 'serums', en: 'Treat', ar: 'العلاج' },
  { cat: 'moisturizers', en: 'Moisturize', ar: 'الترطيب' },
  { cat: 'sunscreens', en: 'Protect (morning)', ar: 'الحماية (صباحًا)' },
]

export default function RoutineFinder() {
  const { t, lang, pick } = useLang()
  const { addToCart } = useShop()
  const [products, setProducts] = useState([])
  const [error, setError] = useState(false)
  const [skin, setSkin] = useState('')
  const [concern, setConcern] = useState('')
  const [done, setDone] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(() => setError(true))
  }, [])

  const routine = useMemo(
    () =>
      STEPS.map((s) => {
        const pool = products.filter(
          (p) => p.category === s.cat && (p.skinTypes.includes('all') || p.skinTypes.includes(skin))
        )
        const best = pool.find((p) => p.concerns.includes(concern)) || pool[0]
        return { ...s, product: best }
      }),
    [products, skin, concern]
  )

  const addAll = () => {
    routine.forEach((r) => r.product && addToCart(r.product))
    setAdded(true)
  }

  const retake = () => {
    setSkin('')
    setConcern('')
    setDone(false)
    setAdded(false)
  }

  return (
    <div className="container quiz">
      <div className="page-head">
        <h1>{t('Skin routine finder', 'اعرفي روتين بشرتك')}</h1>
        <p>{t('Two questions, one routine made for your skin.', 'سؤالان فقط وروتين مناسب لبشرتك.')}</p>
      </div>

      {error && <div className="alert alert-error">{t('Could not load products. Is JSON Server running?', 'تعذر تحميل المنتجات. هل JSON Server شغال؟')}</div>}

      {!done ? (
        <div className="card">
          <h3>1. {t('What is your skin type?', 'ما نوع بشرتك؟')}</h3>
          <div className="options">
            {SKIN_TYPES.map((s) => (
              <button key={s.key} className={`option ${skin === s.key ? 'selected' : ''}`} onClick={() => setSkin(s.key)}>
                {lang === 'ar' ? s.ar : s.en}
              </button>
            ))}
          </div>

          <h3>2. {t('What is your main concern?', 'ما أكثر ما يزعج بشرتك؟')}</h3>
          <div className="options">
            {CONCERNS.map((c) => (
              <button key={c.key} className={`option ${concern === c.key ? 'selected' : ''}`} onClick={() => setConcern(c.key)}>
                {lang === 'ar' ? c.ar : c.en}
              </button>
            ))}
          </div>

          <button className="btn" disabled={!skin || !concern || products.length === 0} onClick={() => setDone(true)}>
            {t('Show my routine', 'اعرضي الروتين')}
          </button>
        </div>
      ) : (
        <div className="stack">
          <p className="muted">
            {t('Skin type', 'نوع البشرة')}: <strong>{labelOf(SKIN_TYPES, skin, lang)}</strong> · {t('Concern', 'المشكلة')}: <strong>{labelOf(CONCERNS, concern, lang)}</strong>
          </p>

          {routine.map((r) => (
            <div key={r.cat} className="card routine-step">
              {r.product ? (
                <>
                  <ProductImage product={r.product} />
                  <div>
                    <div className="step-label">{lang === 'ar' ? r.ar : r.en}</div>
                    <Link to={`/products/${r.product.id}`}><strong>{pick(r.product, 'name')}</strong></Link>
                    <div>{money(finalPrice(r.product))}</div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => addToCart(r.product)}>{t('Add', 'أضف')}</button>
                </>
              ) : (
                <p className="muted">{lang === 'ar' ? r.ar : r.en}: {t('no matching product yet', 'لا يوجد منتج مناسب حاليًا')}</p>
              )}
            </div>
          ))}

          <div className="row">
            <button className="btn" onClick={addAll}>{added ? t('Added to cart ✓', 'تمت الإضافة للسلة ✓') : t('Add all to cart', 'أضف الكل للسلة')}</button>
            <button className="btn btn-outline" onClick={retake}>{t('Retake quiz', 'إعادة الاختبار')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
