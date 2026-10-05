import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import ProductCard from '../../components/ProductCard'
import { useLang } from '../../context/LangContext'
import { SKIN_TYPES, finalPrice, money } from '../../utils/helpers'

const PER_PAGE = 6

export default function Products() {
  const { t, lang, pick } = useLang()
  const [params] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [skin, setSkin] = useState([])
  const [cat, setCat] = useState(params.get('category') || '')
  const [maxPrice, setMaxPrice] = useState(100)
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([p, c]) => {
        setProducts(p.data)
        setCategories(c.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setCat(params.get('category') || '')
  }, [params])

  useEffect(() => {
    setPage(1)
  }, [search, skin, cat, maxPrice, sort])

  const toggleSkin = (key) =>
    setSkin((s) => (s.includes(key) ? s.filter((x) => x !== key) : [...s, key]))

  const reset = () => {
    setSearch('')
    setSkin([])
    setCat('')
    setMaxPrice(100)
    setSort('latest')
  }

  const q = search.trim().toLowerCase()
  let list = products.filter((p) => {
    const nameOk = !q || p.name.toLowerCase().includes(q) || (p.nameAr || '').includes(q)
    const skinOk = !skin.length || p.skinTypes.includes('all') || p.skinTypes.some((s) => skin.includes(s))
    const catOk = !cat || p.category === cat
    return nameOk && skinOk && catOk && finalPrice(p) <= maxPrice
  })

  list = [...list].sort((a, b) => {
    if (sort === 'low') return finalPrice(a) - finalPrice(b)
    if (sort === 'high') return finalPrice(b) - finalPrice(a)
    if (sort === 'rating') return b.rating - a.rating
    return b.id - a.id
  })

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="container">
      <div className="page-head">
        <h1>{t('All products', 'كل المنتجات')}</h1>
        <p>{t('Find the perfect products for your skin.', 'اعثري على المنتجات المناسبة لبشرتك.')}</p>
      </div>

      <div className="sidebar-layout">
        <aside className="card stack">
          <div className="row between">
            <strong>{t('Filter', 'تصفية')}</strong>
            <button className="link-btn" onClick={reset}>{t('Reset', 'إعادة ضبط')}</button>
          </div>

          <div>
            <h4>{t('Skin type', 'نوع البشرة')}</h4>
            {SKIN_TYPES.map((s) => (
              <label key={s.key} className="check">
                <input type="checkbox" checked={skin.includes(s.key)} onChange={() => toggleSkin(s.key)} />
                {lang === 'ar' ? s.ar : s.en}
              </label>
            ))}
          </div>

          <div>
            <h4>{t('Category', 'القسم')}</h4>
            <label className="check">
              <input type="radio" name="cat" checked={cat === ''} onChange={() => setCat('')} />
              {t('All', 'الكل')}
            </label>
            {categories.map((c) => (
              <label key={c.id} className="check">
                <input type="radio" name="cat" checked={cat === c.slug} onChange={() => setCat(c.slug)} />
                {pick(c, 'name')}
              </label>
            ))}
          </div>

          <div>
            <h4>{t('Max price', 'أقصى سعر')}: {money(maxPrice)}</h4>
            <input type="range" min="10" max="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </div>
        </aside>

        <section>
          <div className="row" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              style={{ flex: 1, minWidth: 180 }}
              placeholder={t('Search for products...', 'ابحثي عن منتج...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select style={{ width: 190 }} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">{t('Latest', 'الأحدث')}</option>
              <option value="low">{t('Price: low to high', 'السعر: من الأقل')}</option>
              <option value="high">{t('Price: high to low', 'السعر: من الأعلى')}</option>
              <option value="rating">{t('Top rated', 'الأعلى تقييمًا')}</option>
            </select>
          </div>

          {loading && <div className="loading">{t('Loading...', 'جاري التحميل...')}</div>}
          {error && <div className="alert alert-error">{t('Could not load products. Is JSON Server running?', 'تعذر تحميل المنتجات. هل JSON Server شغال؟')}</div>}
          {!loading && !error && list.length === 0 && (
            <div className="empty">
              <p>{t('No products match your filters.', 'مفيش منتجات مطابقة للتصفية.')}</p>
              <button className="btn btn-outline" onClick={reset}>{t('Clear filters', 'مسح التصفية')}</button>
            </div>
          )}

          <div className="grid-products">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
          <p className="muted center" style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
            {t(`Showing ${shown.length} of ${list.length}`, `عرض ${shown.length} من ${list.length}`)}
          </p>
        </section>
      </div>
    </div>
  )
}
