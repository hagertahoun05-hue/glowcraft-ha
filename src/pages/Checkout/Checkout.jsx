import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { useShop } from '../../context/ShopContext'
import { calcTotals, isPhone, money, today } from '../../utils/helpers'
import '../Cart/Cart.css'

export default function Checkout() {
  const { t, pick } = useLang()
  const { user } = useAuth()
  const { cart, clearCart } = useShop()
  const navigate = useNavigate()
  const { subtotal, shipping, total } = calcTotals(cart)

  const [form, setForm] = useState({
    customerName: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: '',
    payment: 'cod',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const e = {}
    if (form.customerName.trim().length < 3) e.customerName = t('Enter your full name.', 'اكتبي اسمك بالكامل.')
    if (!isPhone(form.phone)) e.phone = t('Enter a valid Egyptian mobile number (01xxxxxxxxx).', 'اكتبي رقم موبايل مصري صحيح (01xxxxxxxxx).')
    if (form.address.trim().length < 8) e.address = t('Enter your full address.', 'اكتبي عنوانك بالتفصيل.')
    if (form.city.trim().length < 2) e.city = t('Enter your city.', 'اكتبي المدينة.')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setServerError('')
    try {
      await api.post('/orders', {
        userId: user.id,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        payment: form.payment,
        items: cart,
        subtotal,
        shipping,
        total,
        status: 'pending',
        date: today(),
      })
      clearCart()
      navigate('/orders')
    } catch {
      setServerError(t('Could not place the order. Is JSON Server running?', 'تعذر إتمام الطلب. هل JSON Server شغال؟'))
    } finally {
      setSaving(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container empty">
        <h2>{t('Nothing to check out', 'لا يوجد شيء لإتمام الشراء')}</h2>
        <Link to="/products" className="btn">{t('Browse products', 'تصفحي المنتجات')}</Link>
      </div>
    )
  }

  const field = (name, label, type = 'text') => (
    <div className={`form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} value={form[name]} onChange={set(name)} />
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="container">
      <div className="page-head"><h1>{t('Checkout', 'إتمام الشراء')}</h1></div>

      <form className="cart-grid" onSubmit={placeOrder} noValidate>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{t('Shipping information', 'بيانات الشحن')}</h3>
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {field('customerName', t('Full name', 'الاسم بالكامل'))}
          {field('phone', t('Phone number', 'رقم الموبايل'), 'tel')}
          {field('address', t('Address', 'العنوان'))}
          {field('city', t('City / Governorate', 'المدينة / المحافظة'))}

          <h3 style={{ margin: '1.2rem 0 0.6rem' }}>{t('Payment method', 'طريقة الدفع')}</h3>
          {[
            ['cod', t('Cash on delivery', 'الدفع عند الاستلام')],
            ['fawry', 'Fawry'],
            ['card', t('Credit / debit card', 'بطاقة ائتمان / خصم')],
          ].map(([value, label]) => (
            <label className="check" key={value}>
              <input type="radio" name="payment" value={value} checked={form.payment === value} onChange={set('payment')} />
              {label}
            </label>
          ))}
        </div>

        <aside className="card">
          <h3>{t('Order summary', 'ملخص الطلب')}</h3>
          {cart.map((i) => (
            <div className="sum-row" key={i.id}>
              <span>{pick(i, 'name')} × {i.qty}</span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="sum-row"><span>{t('Shipping', 'الشحن')}</span><span>{shipping === 0 ? t('Free', 'مجاني') : money(shipping)}</span></div>
          <div className="sum-row total"><span>{t('Total', 'الإجمالي')}</span><span>{money(total)}</span></div>
          <button className="btn btn-block" style={{ marginTop: '1rem' }} disabled={saving}>
            {saving ? t('Placing order...', 'جاري إتمام الطلب...') : t('Place order', 'تأكيد الطلب')}
          </button>
        </aside>
      </form>
    </div>
  )
}
