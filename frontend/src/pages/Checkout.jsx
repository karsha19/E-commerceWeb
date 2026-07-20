import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    shipping_name: '', shipping_phone: '', shipping_address: '',
    shipping_city: '', shipping_state: '', shipping_pincode: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const discountAmount = couponInfo ? (subtotal * couponInfo.discount_percent) / 100 : 0;
  const total = subtotal - discountAmount;

  async function applyCoupon() {
    setCouponError('');
    setCouponInfo(null);
    if (!couponCode) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode });
      setCouponInfo(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...shipping };
      if (couponInfo) payload.coupon_code = couponInfo.code;
      const { data } = await api.post('/orders', payload);
      await refreshCart();
      navigate(`/orders/${data.order_id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="max-w-lg mx-auto px-4 py-24 text-center text-muted">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-10">
      <form id="checkout-form" onSubmit={handleSubmit} className="sm:col-span-2 flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2">Shipping details</h1>

        {error && (
          <div className="alert-error">{error}</div>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name
          <input required value={shipping.shipping_name}
            onChange={(e) => setShipping({ ...shipping, shipping_name: e.target.value })}
            className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone number
          <input required value={shipping.shipping_phone}
            onChange={(e) => setShipping({ ...shipping, shipping_phone: e.target.value })}
            className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Address
          <input required value={shipping.shipping_address}
            onChange={(e) => setShipping({ ...shipping, shipping_address: e.target.value })}
            className="input" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            City
            <input required value={shipping.shipping_city}
              onChange={(e) => setShipping({ ...shipping, shipping_city: e.target.value })}
              className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            State
            <input value={shipping.shipping_state}
              onChange={(e) => setShipping({ ...shipping, shipping_state: e.target.value })}
              className="input" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium max-w-[10rem]">
          Pincode
          <input required value={shipping.shipping_pincode}
            onChange={(e) => setShipping({ ...shipping, shipping_pincode: e.target.value })}
            className="input" />
        </label>

        <div className="mt-2 p-4 border border-line rounded-md bg-surface">
          <p className="font-medium text-sm mb-1">Payment method</p>
          <p className="text-sm text-muted">Cash on delivery — pay when your order arrives.</p>
        </div>

        <button
          type="submit" disabled={submitting}
          className="mt-4 sm:hidden w-full btn-primary"
        >
          {submitting ? 'Placing order…' : `Place order — ₹${total.toFixed(2)}`}
        </button>
      </form>

      <div className="p-5 card h-fit">
        <h2 className="font-semibold mb-4">Order summary</h2>
        <div className="flex flex-col gap-2 text-sm mb-4 max-h-48 overflow-y-auto">
          {items.map(item => (
            <div key={item.cart_id} className="flex justify-between gap-2">
              <span className="text-muted line-clamp-1">{item.name} × {item.quantity}</span>
              <span className="font-mono shrink-0">₹{item.line_total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="tear-line pt-3 mb-3">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 input text-sm font-mono uppercase"
            />
            <button type="button" onClick={applyCoupon} className="px-3 py-1.5 border border-line rounded-md text-sm hover:border-cobalt transition-colors">
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{couponError}</p>}
          {couponInfo && <p className="text-xs text-green-700 dark:text-green-400 mt-1">{couponInfo.discount_percent}% off applied</p>}
        </div>

        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted">Subtotal</span>
          <span className="font-mono">₹{subtotal.toFixed(2)}</span>
        </div>
        {couponInfo && (
          <div className="flex justify-between text-sm mb-1 text-green-700 dark:text-green-400">
            <span>Discount</span>
            <span className="font-mono">−₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-line">
          <span>Total</span>
          <span className="font-mono">₹{total.toFixed(2)}</span>
        </div>

        <button
          type="submit" form="checkout-form" disabled={submitting}
          className="hidden sm:block w-full mt-5 py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-cobalt transition-colors disabled:opacity-50"
        >
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
