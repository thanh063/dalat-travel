import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import type { Place, Review } from '../types';

export default function PlaceDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<Place | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [persons, setPersons] = useState(1);
  const [visitDate, setVisitDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [msg, setMsg] = useState('');

  async function load(){ const r = await api.get(`/places/${slug}`); setP(r.data); }
  useEffect(()=>{ load(); }, [slug]);

  async function submitReview(){
    if (!user) return nav('/login');
    try { await api.post(`/places/${p!.id}/reviews`, { rating, content }); setContent(''); setRating(5); await load(); }
    catch (e:any) { alert(e?.response?.data?.message || 'Không gửi được review'); }
  }

  async function createBooking(){
    if (!user) return nav('/login');
    const r = await api.post('/bookings', { placeId: p!.id, visitDate, persons });
    const ck = await api.post('/payments/checkout', { bookingId: r.data.id });
    setMsg('Đang chuyển đến trang thanh toán demo...'); window.location.href = ck.data.url;
  }

  if (!p) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="card bg-base-100 shadow">
        {p.imageUrl && <figure className="max-h-72 overflow-hidden"><img className="w-full object-cover" src={p.imageUrl} alt={p.name}/></figure>}
        <div className="card-body">
          <h1 className="card-title">{p.name}</h1>
          <p className="opacity-70">{p.address}</p>
          <p>{p.description}</p>
          <div className="flex gap-2 mt-2">{p.tags?.map(t => <span key={t.tag.slug || t.tag.name} className="badge">{t.tag.name}</span>)}</div>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge">⭐ {p.rating.toFixed(1)} ({p.ratingCount})</span>
            <span className="font-semibold">{p.price.toLocaleString()} đ/người</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Đặt chỗ</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input className="input input-bordered" type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)} />
            <input className="input input-bordered" type="number" min={1} value={persons} onChange={e=>setPersons(parseInt(e.target.value||'1'))} />
            <button className="btn btn-primary" onClick={createBooking}>Thanh toán</button>
          </div>
          {msg && <div className="text-sm opacity-70">{msg}</div>}
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Đánh giá</h2>
          <div className="flex gap-2">
            <select className="select select-bordered" value={rating} onChange={e=>setRating(parseInt(e.target.value))}>
              {[1,2,3,4,5].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <input className="input input-bordered flex-1" placeholder="Cảm nhận của bạn..." value={content} onChange={e=>setContent(e.target.value)} />
            <button className="btn" onClick={submitReview}>Gửi</button>
          </div>

          <div className="divider" />
          <ul className="space-y-2">
            {((p as Place & { reviews?: Review[] }).reviews ?? []).map(rv => (
              <li key={rv.id} className="p-3 rounded border">
                <div className="flex justify-between">
                  <strong>{rv.user.fullName}</strong>
                  <span>⭐ {rv.rating}</span>
                </div>
                <p>{rv.content}</p>
                <small className="opacity-60">{new Date(rv.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
