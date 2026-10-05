import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { addMonths, daysLeft, formatDate, today } from '../../utils/helpers'
import './IngredientTracker.css'

export default function IngredientTracker() {
  const { t, lang, pick } = useLang()
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState({ productId: '', openedOn: today() })
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/trackedProducts', { params: { userId: user.id } })])
      .then(([p, i]) => {
        setProducts(p.data)
        setItems(i.data)
        if (p.data.length) setSelectedId(String(p.data[0].id))
      })
      .catch(() => setLoadError(true))
  }, [user.id])

  const selected = products.find((p) => String(p.id) === selectedId)
  const byId = (id) => products.find((p) => p.id === id)

  // CREATE
  const add = async (e) => {
    e.preventDefault()
    if (!form.productId) return setError(t('Choose a product first.', 'اختاري منتجًا أولًا.'))
    if (!form.openedOn || form.openedOn > today()) return setError(t('Opening date cannot be in the future.', 'تاريخ الفتح لا يمكن أن يكون في المستقبل.'))
    setError('')
    const { data } = await api.post('/trackedProducts', {
      userId: user.id,
      productId: Number(form.productId),
      openedOn: form.openedOn,
    })
    setItems([...items, data])
    setForm({ productId: '', openedOn: today() })
  }

  // UPDATE
  const changeDate = async (item, openedOn) => {
    if (!openedOn || openedOn > today()) return
    const { data } = await api.patch(`/trackedProducts/${item.id}`, { openedOn })
    setItems(items.map((i) => (i.id === item.id ? data : i)))
  }

  // DELETE
  const remove = async (id) => {
    await api.delete(`/trackedProducts/${id}`)
    setItems(items.filter((i) => i.id !== id))
  }

  const statusOf = (left) => {
    if (left < 0) return ['badge-danger', t('Expired', 'منتهي')]
    if (left <= 30) return ['badge-warning', t(`${left} days left`, `باقي ${left} يوم`)]
    return ['badge-success', t(`${left} days left`, `باقي ${left} يوم`)]
  }

  return (
    <div className="container">
      <div className="page-head">
        <h1>{t('Ingredient & expiry tracker', 'متتبع المكونات وتاريخ الصلاحية')}</h1>
        <p>{t("Know what's in your products and when to use them by.", 'اعرفي مكونات منتجاتك ومتى تنتهي صلاحيتها.')}</p>
      </div>

      {loadError && <div className="alert alert-error">{t('Could not load data. Is JSON Server running?', 'تعذر تحميل البيانات. هل JSON Server شغال؟')}</div>}

      <div className="tracker-grid">
        <div className="card">
          <h3>{t('Product ingredients', 'مكونات المنتج')}</h3>
          <div className="form-group" style={{ marginTop: '0.8rem' }}>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{pick(p, 'name')}</option>)}
            </select>
          </div>

          {selected && (
            <>
              <strong>{t('Ingredients', 'المكونات')}</strong>
              <div className="tag-list">{pick(selected, 'ingredients').map((i) => <span key={i} className="badge badge-info">{i}</span>)}</div>
              <strong>{t('Benefits', 'الفوائد')}</strong>
              <div className="tag-list">{pick(selected, 'benefits').map((b) => <span key={b} className="badge">{b}</span>)}</div>
              <strong>{t('How to use', 'طريقة الاستخدام')}</strong>
              <p className="muted">{pick(selected, 'howToUse')}</p>
              <p style={{ marginTop: '0.8rem' }}><strong>PAO:</strong> {t(`use within ${selected.pao} months after opening`, `يُستخدم خلال ${selected.pao} شهر من الفتح`)}</p>
            </>
          )}
        </div>

        <div className="card">
          <h3>{t('My products', 'منتجاتي')}</h3>

          <form onSubmit={add} style={{ margin: '0.8rem 0 1rem' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>{t('Product', 'المنتج')}</label>
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                <option value="">{t('Choose a product', 'اختاري منتجًا')}</option>
                {products.map((p) => <option key={p.id} value={p.id}>{pick(p, 'name')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t('Date opened', 'تاريخ الفتح')}</label>
              <input type="date" max={today()} value={form.openedOn} onChange={(e) => setForm({ ...form, openedOn: e.target.value })} />
            </div>
            <button className="btn btn-block">{t('Start tracking', 'ابدئي التتبع')}</button>
          </form>

          {items.length === 0 && <p className="muted">{t('No tracked products yet.', 'لا توجد منتجات متتبعة بعد.')}</p>}

          {items.map((item) => {
            const p = byId(item.productId)
            if (!p) return null
            const expiry = addMonths(item.openedOn, p.pao)
            const [cls, label] = statusOf(daysLeft(expiry))
            return (
              <div className="tracked" key={item.id}>
                <div>
                  <strong>{pick(p, 'name')}</strong>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>{t('Expires', 'ينتهي')}: {formatDate(expiry, lang)}</div>
                  <input type="date" max={today()} value={item.openedOn} onChange={(e) => changeDate(item, e.target.value)} />
                </div>
                <div style={{ textAlign: 'end' }}>
                  <span className={`badge ${cls}`}>{label}</span>
                  <div><button className="link-btn" onClick={() => remove(item.id)}>{t('Remove', 'حذف')}</button></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
