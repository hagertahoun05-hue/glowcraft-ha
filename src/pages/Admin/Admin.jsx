import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { finalPrice, formatDate, money } from '../../utils/helpers'
import './Admin.css'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered']

const EMPTY = {
  name: '', nameAr: '', category: 'serums', price: '', discount: 0, stock: 0,
  emoji: '🧴', description: '', descriptionAr: '',
}

// default values for fields the admin form does not edit
const NEW_PRODUCT_DEFAULTS = {
  skinTypes: ['all'], concerns: [], ingredients: [], ingredientsAr: [], benefits: [], benefitsAr: [],
  pao: 12, rating: 4.5, reviews: 0, bestSeller: false, color: '#f3e2da', image: '',
  howToUse: '', howToUseAr: '',
}

export default function Admin() {
  const { t, lang, pick } = useLang()
  const { user } = useAuth()

  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const load = () =>
    Promise.all([
      api.get('/products'), api.get('/categories'), api.get('/orders'),
      api.get('/users'), api.get('/messages'),
    ])
      .then(([p, c, o, u, m]) => {
        setProducts(p.data)
        setCategories(c.data)
        setOrders(o.data)
        setUsers(u.data)
        setMessages(m.data)
      })
      .catch(() => setError(true))

  useEffect(() => {
    load()
  }, [])

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name, nameAr: p.nameAr || '', category: p.category, price: p.price, discount: p.discount,
      stock: p.stock, emoji: p.emoji || '', description: p.description || '', descriptionAr: p.descriptionAr || '',
    })
    setErrors({})
    setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = t('Name must be at least 3 characters.', 'الاسم 3 أحرف على الأقل.')
    if (!(Number(form.price) > 0)) e.price = t('Price must be greater than 0.', 'السعر يجب أن يكون أكبر من 0.')
    if (!(Number(form.stock) >= 0) || form.stock === '') e.stock = t('Stock cannot be negative.', 'الكمية لا يمكن أن تكون سالبة.')
    if (Number(form.discount) < 0 || Number(form.discount) > 90) e.discount = t('Discount must be between 0 and 90.', 'الخصم بين 0 و 90.')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // CREATE / UPDATE
  const save = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const base = editingId ? products.find((p) => p.id === editingId) : NEW_PRODUCT_DEFAULTS
    const payload = {
      ...base,
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
    }
    if (editingId) {
      const { data } = await api.put(`/products/${editingId}`, payload)
      setProducts(products.map((p) => (p.id === editingId ? data : p)))
    } else {
      const { data } = await api.post('/products', payload)
      setProducts([...products, data])
    }
    setShowForm(false)
  }

  // DELETE
  const remove = async (path, id, setter, list, message) => {
    if (!window.confirm(message)) return
    await api.delete(`${path}/${id}`)
    setter(list.filter((x) => x.id !== id))
  }

  const changeStatus = async (order, status) => {
    const { data } = await api.patch(`/orders/${order.id}`, { status })
    setOrders(orders.map((o) => (o.id === order.id ? data : o)))
  }

  const confirmText = t('Delete this item?', 'حذف هذا العنصر؟')
  const catName = (slug) => pick(categories.find((c) => c.slug === slug) || { name: slug }, 'name')
  const statusLabel = {
    pending: t('Pending', 'قيد الانتظار'), processing: t('Processing', 'قيد التجهيز'),
    shipped: t('Shipped', 'تم الشحن'), delivered: t('Delivered', 'تم التسليم'),
  }

  const menu = [
    ['products', t('Products', 'المنتجات')],
    ['orders', t('Orders', 'الطلبات')],
    ['users', t('Users', 'المستخدمون')],
    ['messages', t('Messages', 'الرسائل')],
  ]

  return (
    <div className="container">
      <div className="page-head"><h1>{t('Dashboard', 'لوحة التحكم')}</h1></div>
      {error && <div className="alert alert-error">{t('Could not load data. Is JSON Server running?', 'تعذر تحميل البيانات. هل JSON Server شغال؟')}</div>}

      <div className="stats">
        <div className="card stat"><span className="muted">{t('Total products', 'المنتجات')}</span><strong>{products.length}</strong></div>
        <div className="card stat"><span className="muted">{t('Total orders', 'الطلبات')}</span><strong>{orders.length}</strong></div>
        <div className="card stat"><span className="muted">{t('Total users', 'المستخدمون')}</span><strong>{users.length}</strong></div>
        <div className="card stat"><span className="muted">{t('Active offers', 'العروض')}</span><strong>{products.filter((p) => p.discount > 0).length}</strong></div>
      </div>

      <div className="admin-layout">
        <aside className="card admin-menu">
          {menu.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
        </aside>

        <section className="card">
          {tab === 'products' && (
            <>
              <div className="row between" style={{ marginBottom: '1rem' }}>
                <h3>{t('Products', 'المنتجات')}</h3>
                <button className="btn btn-sm" onClick={openNew}>+ {t('Add product', 'إضافة منتج')}</button>
              </div>

              {showForm && (
                <form onSubmit={save} noValidate className="card" style={{ marginBottom: '1.2rem', background: 'var(--surface-2)' }}>
                  <h4 style={{ marginBottom: '0.8rem' }}>{editingId ? t('Edit product', 'تعديل المنتج') : t('New product', 'منتج جديد')}</h4>
                  <div className="form-grid">
                    <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                      <label>{t('Name (English)', 'الاسم (إنجليزي)')}</label>
                      <input value={form.name} onChange={set('name')} />
                      {errors.name && <div className="error-text">{errors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label>{t('Name (Arabic)', 'الاسم (عربي)')}</label>
                      <input value={form.nameAr} onChange={set('nameAr')} />
                    </div>
                    <div className="form-group">
                      <label>{t('Category', 'القسم')}</label>
                      <select value={form.category} onChange={set('category')}>
                        {categories.map((c) => <option key={c.id} value={c.slug}>{pick(c, 'name')}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('Emoji', 'رمز المنتج')}</label>
                      <input value={form.emoji} onChange={set('emoji')} />
                    </div>
                    <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                      <label>{t('Price ($)', 'السعر ($)')}</label>
                      <input type="number" step="0.01" value={form.price} onChange={set('price')} />
                      {errors.price && <div className="error-text">{errors.price}</div>}
                    </div>
                    <div className={`form-group ${errors.discount ? 'has-error' : ''}`}>
                      <label>{t('Discount (%)', 'الخصم (%)')}</label>
                      <input type="number" value={form.discount} onChange={set('discount')} />
                      {errors.discount && <div className="error-text">{errors.discount}</div>}
                    </div>
                    <div className={`form-group ${errors.stock ? 'has-error' : ''}`}>
                      <label>{t('Stock', 'الكمية')}</label>
                      <input type="number" value={form.stock} onChange={set('stock')} />
                      {errors.stock && <div className="error-text">{errors.stock}</div>}
                    </div>
                    <div className="form-group full">
                      <label>{t('Description (English)', 'الوصف (إنجليزي)')}</label>
                      <textarea value={form.description} onChange={set('description')} />
                    </div>
                    <div className="form-group full">
                      <label>{t('Description (Arabic)', 'الوصف (عربي)')}</label>
                      <textarea value={form.descriptionAr} onChange={set('descriptionAr')} />
                    </div>
                  </div>
                  <div className="row">
                    <button className="btn btn-sm">{t('Save', 'حفظ')}</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => setShowForm(false)}>{t('Cancel', 'إلغاء')}</button>
                  </div>
                </form>
              )}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th></th><th>{t('Name', 'الاسم')}</th><th>{t('Category', 'القسم')}</th><th>{t('Price', 'السعر')}</th><th>{t('Stock', 'الكمية')}</th><th>{t('Status', 'الحالة')}</th><th></th></tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td><div className="thumb" style={{ background: p.color }}>{p.emoji}</div></td>
                        <td>{pick(p, 'name')}</td>
                        <td>{catName(p.category)}</td>
                        <td>{money(finalPrice(p))}</td>
                        <td>{p.stock}</td>
                        <td>
                          <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                            {p.stock > 0 ? t('Active', 'متاح') : t('Out of stock', 'نفد')}
                          </span>
                        </td>
                        <td>
                          <div className="row">
                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>✎</button>
                            <button className="btn btn-sm btn-danger" onClick={() => remove('/products', p.id, setProducts, products, confirmText)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'orders' && (
            <div className="table-wrap">
              <h3 style={{ marginBottom: '1rem' }}>{t('Orders', 'الطلبات')}</h3>
              <table>
                <thead><tr><th>#</th><th>{t('Customer', 'العميل')}</th><th>{t('Date', 'التاريخ')}</th><th>{t('Total', 'الإجمالي')}</th><th>{t('Status', 'الحالة')}</th></tr></thead>
                <tbody>
                  {[...orders].sort((a, b) => b.id - a.id).map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customerName}</td>
                      <td>{formatDate(o.date, lang)}</td>
                      <td>{money(o.total)}</td>
                      <td>
                        <select value={o.status} onChange={(e) => changeStatus(o, e.target.value)} style={{ width: 150 }}>
                          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'users' && (
            <div className="table-wrap">
              <h3 style={{ marginBottom: '1rem' }}>{t('Users', 'المستخدمون')}</h3>
              <table>
                <thead><tr><th>{t('Name', 'الاسم')}</th><th>{t('Email', 'البريد')}</th><th>{t('Role', 'الدور')}</th><th></th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge badge-info">{u.role}</span></td>
                      <td>
                        {u.id !== user.id && u.role !== 'admin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => remove('/users', u.id, setUsers, users, confirmText)}>🗑</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'messages' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>{t('Messages', 'الرسائل')}</h3>
              {messages.length === 0 && <p className="muted">{t('No messages yet.', 'لا توجد رسائل بعد.')}</p>}
              {messages.map((m) => (
                <div key={m.id} className="card" style={{ marginBottom: '0.8rem' }}>
                  <div className="row between">
                    <strong>{m.subject}</strong>
                    <button className="link-btn" onClick={() => remove('/messages', m.id, setMessages, messages, confirmText)}>{t('Delete', 'حذف')}</button>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>{m.name} · {m.email}</div>
                  <p>{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
