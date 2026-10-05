import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ProductImage from '../../components/ProductImage'
import { useLang } from '../../context/LangContext'
import { useShop } from '../../context/ShopContext'
import { SKIN_TYPES, finalPrice, labelOf, money } from '../../utils/helpers'
import './Wishlist.css'

export default function Wishlist() {
  const { t, lang, pick } = useLang()
  const { wishlist, toggleWishlist, compare, toggleCompare, addToCart } = useShop()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [limitMsg, setLimitMsg] = useState(false)

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(() => setError(true)).finally(() => setLoading(false))
  }, [])

  const wished = products.filter((p) => wishlist.includes(p.id))
  const compared = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean)

  const onCompare = (id) => {
    const ok = toggleCompare(id)
    setLimitMsg(!ok)
  }

  const skinText = (p) =>
    p.skinTypes.includes('all') ? t('All', 'الكل') : p.skinTypes.map((s) => labelOf(SKIN_TYPES, s, lang)).join('، ')

  const rows = [
    [t('Price', 'السعر'), (p) => money(finalPrice(p))],
    [t('Skin type', 'نوع البشرة'), skinText],
    [t('Rating', 'التقييم'), (p) => `★ ${p.rating}`],
    [t('Benefits', 'الفوائد'), (p) => pick(p, 'benefits').join('، ')],
    [t('Key ingredients', 'المكونات'), (p) => pick(p, 'ingredients').join('، ')],
    [t('PAO', 'مدة الصلاحية'), (p) => t(`${p.pao} months`, `${p.pao} شهر`)],
  ]

  return (
    <div className="container">
      <div className="page-head">
        <h1>{t('Wishlist & compare', 'المفضلة والمقارنة')}</h1>
        <p>{t('Save products you love and compare up to 3 side by side.', 'احفظي منتجاتك المفضلة وقارني بين 3 منتجات.')}</p>
      </div>

      {loading && <div className="loading">{t('Loading...', 'جاري التحميل...')}</div>}
      {error && <div className="alert alert-error">{t('Could not load products. Is JSON Server running?', 'تعذر تحميل المنتجات. هل JSON Server شغال؟')}</div>}

      <div className="wl-grid">
        <div className="card">
          <h3>{t('My wishlist', 'مفضلتي')} ({wished.length})</h3>
          {wished.length === 0 && !loading && (
            <div className="empty">
              <p>{t('Your wishlist is empty.', 'المفضلة فاضية.')}</p>
              <Link to="/products" className="btn btn-sm">{t('Browse products', 'تصفحي المنتجات')}</Link>
            </div>
          )}
          {wished.map((p) => (
            <div className="wl-item" key={p.id}>
              <ProductImage product={p} />
              <div>
                <Link to={`/products/${p.id}`}><strong>{pick(p, 'name')}</strong></Link>
                <div>{money(finalPrice(p))}</div>
                <label className="check">
                  <input type="checkbox" checked={compare.includes(p.id)} onChange={() => onCompare(p.id)} />
                  {t('Compare', 'قارني')}
                </label>
              </div>
              <div className="stack" style={{ textAlign: 'end' }}>
                <button className="btn btn-sm" onClick={() => addToCart(p)}>🛒</button>
                <button className="link-btn" onClick={() => toggleWishlist(p.id)}>{t('Remove', 'حذف')}</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>{t('Compare products', 'مقارنة المنتجات')}</h3>
          {limitMsg && <div className="alert alert-error" style={{ marginTop: '0.7rem' }}>{t('You can compare up to 3 products.', 'يمكنك مقارنة 3 منتجات كحد أقصى.')}</div>}

          {compared.length < 2 ? (
            <p className="muted" style={{ marginTop: '0.8rem' }}>{t('Select at least 2 products from your wishlist to compare.', 'اختاري منتجين على الأقل من المفضلة للمقارنة.')}</p>
          ) : (
            <div className="table-wrap" style={{ marginTop: '0.8rem' }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th></th>
                    {compared.map((p) => <th key={p.id}>{pick(p, 'name')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, fn]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      {compared.map((p) => <td key={p.id}>{fn(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
