import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSearchParams } from 'react-router-dom';

export function Checkout() {
  const [sp] = useSearchParams();
  const success = decodeURIComponent(sp.get('success') || '');
  const cancel = decodeURIComponent(sp.get('cancel') || '');
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Thanh toán demo</h1>
      <div className="flex gap-2">
        <a className="btn btn-primary" href={success}>Giả lập thành công</a>
        <a className="btn" href={cancel}>Hủy</a>
      </div>
    </div>
  );
}

export function Success() {
  const [sp] = useSearchParams();
  const bookingId = sp.get('bookingId');
  const [ok, setOk] = useState(false);
  useEffect(()=>{ (async()=>{ const r = await api.get('/payments/success', { params: { bookingId } }); setOk(r.data.ok); })(); }, [bookingId]);
  return <div className="p-6">{ok ? 'Thanh toán thành công!' : 'Đang xử lý...'}</div>;
}
export function Cancel() { return <div className="p-6">Thanh toán đã hủy.</div>; }
