import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import ProductImage from '../../components/ProductImage'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { useShop } from '../../context/ShopContext'
import { finalPrice, money, today } from '../../utils/helpers'
import './ProductDetails.css'

export default function ProductDetails() {
  const { id } = useParams()
  const { t, pick } = useLang()
  const { user } = useAuth()
  const { addToCart, toggleWishlist, wishlist } = useShop()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [status, setStatus] = useState('loading')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [added, setAdded] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    setStatus('loading')
    setQty(1)
    Promise.all([api.get(`/products/${id}`), api.get('/reviews', { params: { productId: id } })])
      .then(([p, r]) => {
        setProduct(p.data)
        setReviews(r.data)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [id])

  if (status === 'loading') return <div className="loading">{t('Loading...', 'جاري التحميل...')}</div>
  if (status === 'error')
    return (
      <div className="container empty">
        <p>{t('Product not found.', 'المنتج غير موجود.')}</p>
        <Link to="/products" className="btn">{t('Back to products', 'العودة للمنتجات')}</Link>
      </div>
    )

  const liked = wishlist.includes(product.id)

  const onAdd = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const onWish = () => {
    if (!user) return navigate('/login', { state: { from: `/products/${id}` } })
    toggleWishlist(product.id)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (review.comment.trim().length < 5) {
      setReviewError(t('Write at least 5 characters.', 'اكتبي 5 أحرف على الأقل.'))
      return
    }
    setReviewError('')
    const { data } = await api.post('/reviews', {
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: Number(review.rating),
      comment: review.comment.trim(),
      date: today(),
    })
    setReviews([...reviews, data])
    setReview({ rating: 5, comment: '' })
  }

  const tabs = [
    ['description', t('Description', 'الوصف')],
    ['ingredients', t('Ingredients', 'المكونات')],
    ['howto', t('How to use', 'طريقة الاستخدام')],
    ['reviews', `${t('Reviews', 'التقييمات')} (${reviews.length})`],
  ]

  return (
    <div className="container">
      <p className="muted" style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
        <Link to="/">{t('Home', 'الرئيسية')}</Link> / <Link to="/products">{t('Products', 'المنتجات')}</Link> / {pick(product, 'name')}
      </p>

      <div className="pd">
        <ProductImage product={product} big />

        <div>
          <h1>{pick(product, 'name')}</h1>
          <div className="row">
            <span className="stars">★ {product.rating}</span>
            <span className="muted">({product.reviews} {t('reviews', 'تقييم')})</span>
          </div>

          <div className="pd-price">
            {money(finalPrice(product))}
            {product.discount > 0 && (
              <>
                <span className="price-old">{money(product.price)}</span>
                <span className="badge badge-danger">-{product.discount}%</span>
              </>
            )}
          </div>

          <p className="muted">{pick(product, 'description')}</p>

          <div className="row" style={{ margin: '1.4rem 0' }}>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 1, qty + 1))} aria-label="+">+</button>
            </div>
            <button className="btn" style={{ flex: 1 }} disabled={product.stock < 1} onClick={onAdd}>
              {product.stock < 1 ? t('Out of stock', 'غير متوفر') : added ? t('Added ✓', 'تمت الإضافة ✓') : t('Add to cart', 'أضف إلى السلة')}
            </button>
            <button className="btn btn-outline" onClick={onWish}>{liked ? '♥' : '♡'}</button>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            {t('In stock', 'متوفر')}: {product.stock}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="tabs">
          {tabs.map(([key, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {tab === 'description' && <p>{pick(product, 'description')}</p>}

        {tab === 'ingredients' && (
          <div className="info-grid">
            <div className="card">
              <h3>{t('Key ingredients', 'المكونات الأساسية')}</h3>
              {pick(product, 'ingredients').map((i) => <div className="ing-item" key={i}>{i}</div>)}
            </div>
            <div className="card">
              <h3>{t('Benefits', 'الفوائد')}</h3>
              {pick(product, 'benefits').map((b) => <div className="ing-item" key={b}>{b}</div>)}
            </div>
            <div className="card pao">
              <div className="pao-icon">{product.pao}M</div>
              <div>
                <strong>PAO</strong>
                <p className="muted">{t(`Use within ${product.pao} months after opening.`, `يُستخدم خلال ${product.pao} شهر من الفتح.`)}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'howto' && <div className="card"><p>{pick(product, 'howToUse')}</p></div>}

        {tab === 'reviews' && (
          <div className="card">
            {reviews.length === 0 && <p className="muted">{t('No reviews yet.', 'لا توجد تقييمات بعد.')}</p>}
            {reviews.map((r) => (
              <div className="review" key={r.id}>
                <div className="row between"><strong>{r.userName}</strong><span className="stars">{'★'.repeat(r.rating)}</span></div>
                <p>{r.comment}</p>
              </div>
            ))}

            {user ? (
              <form onSubmit={submitReview} style={{ marginTop: '1.2rem' }}>
                <div className="form-group">
                  <label>{t('Your rating', 'تقييمك')}</label>
                  <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                  </select>
                </div>
                <div className={`form-group ${reviewError ? 'has-error' : ''}`}>
                  <label>{t('Your review', 'رأيك')}</label>
                  <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
                  {reviewError && <div className="error-text">{reviewError}</div>}
                </div>
                <button className="btn">{t('Post review', 'نشر التقييم')}</button>
              </form>
            ) : (
              <p style={{ marginTop: '1rem' }}>
                <Link to="/login" state={{ from: `/products/${id}` }} className="link-btn">{t('Login to write a review', 'سجّلي الدخول لكتابة تقييم')}</Link>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
