import { Link, useNavigate } from 'react-router-dom'
import ProductImage from './ProductImage'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'
import { finalPrice, money } from '../utils/helpers'

export default function ProductCard({ product }) {
  const { t, pick } = useLang()
  const { user } = useAuth()
  const { addToCart, toggleWishlist, wishlist } = useShop()
  const navigate = useNavigate()

  const liked = wishlist.includes(product.id)

  const onHeart = () => {
    if (!user) return navigate('/login', { state: { from: '/products' } })
    toggleWishlist(product.id)
  }

  return (
    <div className="card product-card">
      {product.discount > 0 && <span className="badge badge-danger discount">-{product.discount}%</span>}
      <button
        className={`heart ${liked ? 'on' : ''}`}
        onClick={onHeart}
        aria-label={t('Add to wishlist', 'أضف إلى المفضلة')}
      >
        {liked ? '♥' : '♡'}
      </button>

      <Link to={`/products/${product.id}`}>
        <ProductImage product={product} />
        <h3 className="p-name">{pick(product, 'name')}</h3>
      </Link>

      <div className="p-meta">
        <span className="stars">★ {product.rating}</span>
        <span className="muted">({product.reviews})</span>
      </div>

      <div className="p-price">
        <strong>{money(finalPrice(product))}</strong>
        {product.discount > 0 && <span className="price-old">{money(product.price)}</span>}
      </div>

      <button
        className="btn btn-sm btn-block"
        disabled={product.stock < 1}
        onClick={() => addToCart(product)}
      >
        {product.stock < 1 ? t('Out of stock', 'غير متوفر') : t('Add to cart', 'أضف إلى السلة')}
      </button>
    </div>
  )
}
