import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ProductCard from '../../components/ProductCard'
import { useLang } from '../../context/LangContext'
import './Home.css'

export default function Home() {
  const { t, pick } = useLang()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([p, c]) => {
        setProducts(p.data)
        setCategories(c.data)
      })
      .catch(() => setError('load'))
      .finally(() => setLoading(false))
  }, [])

  const offers = products.filter((p) => p.discount > 0).slice(0, 4)
  const best = products.filter((p) => p.bestSeller).slice(0, 4)

  return (
    <div className="container">
      <section className="hero">
        <div>
          <h1>{t('Discover Your Natural Glow', 'اكتشفي إشراقتك الطبيعية')}</h1>
          <p>
            {t(
              'Personalized skincare for healthier, brighter and happier skin.',
              'عناية مخصصة ببشرتك لتصبح أكثر صحة وإشراقًا وسعادة.'
            )}
          </p>
          <div className="row">
            <Link to="/products" className="btn">{t('Shop now', 'تسوقي الآن')}</Link>
            <Link to="/routine" className="btn btn-outline">{t('Find my routine', 'اعرفي روتينك')}</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">🧴🌸</div>
      </section>

      <div className="features">
        <div className="card feature"><span>🚚</span><div><strong>{t('Free shipping', 'شحن مجاني')}</strong><small>{t('On orders over $50', 'للطلبات فوق 50$')}</small></div></div>
        <div className="card feature"><span>🌿</span><div><strong>{t('Natural ingredients', 'مكونات طبيعية')}</strong><small>{t('Safe and effective', 'آمنة وفعّالة')}</small></div></div>
        <div className="card feature"><span>🩺</span><div><strong>{t('Skincare experts', 'خبراء العناية بالبشرة')}</strong><small>{t('Trusted by customers', 'موثوقة من عملائنا')}</small></div></div>
      </div>

      {loading && <div className="loading">{t('Loading...', 'جاري التحميل...')}</div>}
      {error && (
        <div className="alert alert-error">
          {t('Could not load data. Make sure JSON Server is running (npm run server).', 'تعذر تحميل البيانات. تأكدي أن JSON Server شغال (npm run server).')}
        </div>
      )}

      {offers.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>{t('Weekly offers', 'عروض الأسبوع')}</h2>
            <Link to="/products" className="link-btn">{t('View all', 'عرض الكل')}</Link>
          </div>
          <div className="grid-products">{offers.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {best.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>{t('Best sellers', 'الأكثر مبيعًا')}</h2></div>
          <div className="grid-products">{best.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>{t('Shop by category', 'تسوقي حسب القسم')}</h2></div>
          <div className="cats">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="card cat">
                <span className="emoji">{c.emoji}</span>
                {pick(c, 'name')}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="card quiz-banner">
          <div>
            <h2>{t("Don't know your skin type?", 'مش عارفة نوع بشرتك؟')}</h2>
            <p className="muted">{t('Answer two quick questions and get a routine made for you.', 'جاوبي على سؤالين وهنجهزلك روتين مناسب لبشرتك.')}</p>
          </div>
          <Link to="/routine" className="btn">{t('Find my routine', 'اعرفي روتينك')}</Link>
        </div>
      </section>
    </div>
  )
}
