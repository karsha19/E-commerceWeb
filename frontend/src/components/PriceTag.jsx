export default function PriceTag({ price, discount = 0, size = 'md' }) {
  const hasDiscount = discount > 0;
  const finalPrice = price - (price * discount) / 100;
  const sizeClass = size === 'lg' ? 'price-tag price-tag--lg' : 'price-tag';
  const tagClass = hasDiscount ? `${sizeClass} price-tag--sale` : sizeClass;

  return (
    <span className="inline-flex items-center gap-2">
      <span className={tagClass}>₹{finalPrice.toFixed(2)}</span>
      {hasDiscount && (
        <span className="price-tag-strike">₹{Number(price).toFixed(2)}</span>
      )}
    </span>
  );
}
