import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => setOrder(false));
  }, [id]);

  if (order === null) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Loading…</div>;
  if (order === false) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">Order not found.</div>;

  const stepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  async function downloadInvoice() {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-order-${id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {location.state?.justPlaced && (
        <div className="mb-6 px-4 py-3 alert-success">
          Order placed successfully! A confirmation email is on its way.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <button onClick={downloadInvoice} className="px-4 py-2 border border-line rounded-md text-sm font-medium hover:border-cobalt hover:text-cobalt transition-colors">
          Download invoice
        </button>
      </div>

      {/* Tracking */}
      {!isCancelled ? (
        <div className="flex items-center mb-10">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? 'bg-ink text-paper' : 'bg-line text-muted'}`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1.5 capitalize text-center">{step}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-5 ${i < stepIndex ? 'bg-ink' : 'bg-line'}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-10 px-4 py-3 alert-error">
          This order was cancelled.
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-3 mb-8 tear-line pt-5">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span className="font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-3 border-t border-line">
          <span>Total</span>
          <span className="font-mono">₹{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="p-4 card text-sm">
        <p className="font-medium mb-1">Shipping to</p>
        <p className="text-muted">{order.shipping_name} · {order.shipping_phone}</p>
        <p className="text-muted">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
        <p className="text-muted mt-2">Payment: Cash on delivery</p>
      </div>
    </div>
  );
}
