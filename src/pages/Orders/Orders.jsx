import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate, money } from '../../utils/helpers'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered']
const BADGE = { pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-info', delivered: 'badge-success' }

export default function Orders() {
  const { t, lang, pick } = useLang()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    api
      .get('/orders', { params: { userId: user.id } })
      .then((r) => setOrders([...r.data].sort((a, b) => b.id - a.id)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user.id])

  const statusLabel = {
    pending: t('Pending', 'قيد الانتظار'),
    processing: t('Processing', 'قيد التجهيز'),
    shipped: t('Shipped', 'تم الشحن'),
    delivered: t('Delivered', 'تم التسليم'),
  }

  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="container">
      <div className="page-head"><h1>{t('My orders', 'طلباتي')}</h1></div>

      <div className="tabs">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? t('All', 'الكل') : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading && <div className="loading">{t('Loading...', 'جاري التحميل...')}</div>}
      {error && <div className="alert alert-error">{t('Could not load orders. Is JSON Server running?', 'تعذر تحميل الطلبات. هل JSON Server شغال؟')}</div>}

      {!loading && !error && shown.length === 0 && (
        <div className="empty">
          <p>{t('No orders here yet.', 'لا توجد طلبات هنا بعد.')}</p>
          <Link to="/products" className="btn">{t('Start shopping', 'ابدئي التسوق')}</Link>
        </div>
      )}

      <div className="stack">
        {shown.map((o) => (
          <div className="card" key={o.id}>
            <div className="row between">
              <div>
                <strong>#{o.id}</strong>
                <span className="muted"> · {o.items.reduce((s, i) => s + i.qty, 0)} {t('items', 'منتجات')} · {formatDate(o.date, lang)}</span>
              </div>
              <div className="row">
                <strong>{money(o.total)}</strong>
                <span className={`badge ${BADGE[o.status]}`}>{statusLabel[o.status]}</span>
                <button className="btn btn-sm btn-outline" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                  {openId === o.id ? t('Hide', 'إخفاء') : t('View details', 'التفاصيل')}
                </button>
              </div>
            </div>

            {openId === o.id && (
              <div style={{ marginTop: '1rem' }}>
                {o.items.map((i) => (
                  <div className="row between" key={i.id} style={{ padding: '0.3rem 0' }}>
                    <span>{i.emoji} {pick(i, 'name')} × {i.qty}</span>
                    <span>{money(i.price * i.qty)}</span>
                  </div>
                ))}
                <p className="muted" style={{ marginTop: '0.6rem', fontSize: '0.88rem' }}>
                  {t('Shipping to', 'الشحن إلى')}: {o.address}{o.city ? `، ${o.city}` : ''} · {o.phone}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
