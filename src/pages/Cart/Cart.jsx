import { Link, useNavigate } from 'react-router-dom'
import ProductImage from '../../components/ProductImage'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { useShop } from '../../context/ShopContext'
import { FREE_SHIPPING_FROM, calcTotals, money } from '../../utils/helpers'
import './Cart.css'

export default function Cart() {
  const { t, pick } = useLang()
  const { user } = useAuth()
  const { cart, setQty, removeFromCart, clearCart } = useShop()
  const navigate = useNavigate()
  const { subtotal, shipping, total } = calcTotals(cart)

  const checkout = () => {
    if (!user) return navigate('/login', { state: { from: '/checkout' } })
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="container empty">
        <h2>{t('Your cart is empty', 'السلة فاضية')}</h2>
        <p>{t('Add a few products and they will show up here.', 'أضيفي بعض المنتجات وهتظهر هنا.')}</p>
        <Link to="/products" className="btn">{t('Start shopping', 'ابدئي التسوق')}</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-head row between">
        <h1>{t('Your cart', 'سلة التسوق')} ({cart.length})</h1>
        <button className="link-btn" onClick={clearCart}>{t('Clear cart', 'تفريغ السلة')}</button>
      </div>

      <div className="cart-grid">
        <div className="card">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <ProductImage product={item} />
              <div>
                <Link to={`/products/${item.id}`}><strong>{pick(item, 'name')}</strong></Link>
                <div className="muted">{money(item.price)}</div>
              </div>
              <div className="qty-sm">
                <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="-">−</button>
                <span>{item.qty}</span>
                <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="+">+</button>
              </div>
              <div style={{ textAlign: 'end' }}>
                <strong>{money(item.price * item.qty)}</strong>
                <div><button className="link-btn" onClick={() => removeFromCart(item.id)}>{t('Remove', 'حذف')}</button></div>
              </div>
            </div>
          ))}
        </div>

        <aside className="card">
          <h3>{t('Order summary', 'ملخص الطلب')}</h3>
          <div className="sum-row"><span>{t('Subtotal', 'المجموع')}</span><span>{money(subtotal)}</span></div>
          <div className="sum-row"><span>{t('Shipping', 'الشحن')}</span><span>{shipping === 0 ? t('Free', 'مجاني') : money(shipping)}</span></div>
          {shipping > 0 && <p className="muted" style={{ fontSize: '0.8rem' }}>{t(`Free shipping on orders over $${FREE_SHIPPING_FROM}`, `شحن مجاني للطلبات فوق ${FREE_SHIPPING_FROM}$`)}</p>}
          <div className="sum-row total"><span>{t('Total', 'الإجمالي')}</span><span>{money(total)}</span></div>
          <button className="btn btn-block" style={{ marginTop: '1rem' }} onClick={checkout}>{t('Proceed to checkout', 'إتمام الشراء')}</button>
        </aside>
      </div>
    </div>
  )
}
