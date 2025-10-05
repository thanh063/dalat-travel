import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import type { Place } from '../types';

export default function PlacesList() {
  const [items, setItems] = useState<Place[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt:desc');

  async function load() {
    const r = await api.get('/places', { params: { page, pageSize, search, sort } });
    setItems(r.data.items); setTotal(r.data.total);
  }
  useEffect(()=>{ load(); }, [page, sort]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input className="input input-bordered w-full" placeholder="Tìm kiếm..." value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={()=>{ setPage(1); load(); }}>Tìm</button>
        <select className="select select-bordered" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="createdAt:desc">Mới nhất</option>
          <option value="price:asc">Giá tăng</option>
          <option value="price:desc">Giá giảm</option>
          <option value="rating:desc">Rating cao</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map(p => (
          <Link key={p.id} to={`/places/${p.slug}`} className="card bg-base-100 shadow hover:shadow-md">
            {p.imageUrl && (
              <figure className="h-40 overflow-hidden">
                <img className="w-full object-cover h-40" src={p.imageUrl} alt={p.name}/>
              </figure>
            )}
            <div className="card-body">
              <h2 className="card-title">{p.name}</h2>
              <p className="text-sm opacity-70">{p.address}</p>
              <div className="flex justify-between items-center">
                <span className="badge">⭐ {p.rating.toFixed(1)} ({p.ratingCount})</span>
                <span className="font-semibold">{p.price.toLocaleString()} đ</span>
              </div>
              <div className="flex gap-2 mt-2">
                {p.tags?.map(t => <span key={t.tag.slug || t.tag.name} className="badge badge-outline">{t.tag.name}</span>)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="join mt-6">
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map(n => (
          <button key={n} className={`join-item btn ${page===n?'btn-active':''}`} onClick={()=>setPage(n)}>{n}</button>
        ))}
      </div>
    </div>
  );
}
