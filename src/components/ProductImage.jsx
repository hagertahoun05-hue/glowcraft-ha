export default function ProductImage({ product, big = false }) {
  if (product.image) {
    return <img className={`p-img ${big ? 'big' : ''}`} src={product.image} alt={product.name} />
  }
  return (
    <div className={`p-img ${big ? 'big' : ''}`} style={{ background: product.color || '#f3e2da' }}>
      <span>{product.emoji || '🧴'}</span>
    </div>
  )
}
