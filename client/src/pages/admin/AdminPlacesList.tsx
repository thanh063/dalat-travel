import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import type { Place } from '../../types';

export default function AdminPlacesList() {
  const [items, setItems] = useState<Place[]>([]);
  async function load(){ const r = await api.get('/places', { params: { page:1, pageSize:100, sort:'createdAt:desc' } }); setItems(r.data.items); }
  useEffect(()=>{ load(); }, []);
  async function del(id:string){ if (!confirm('Xóa?')) return; await api.delete(`/places/${id}`); load(); }
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-semibold">Quản lý địa điểm</h1>
        <Link to="/admin/places/new" className="btn btn-primary">Thêm mới</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr><th>Tên</th><th>Giá</th><th>Slug</th><th/></tr></thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.price.toLocaleString()}</td><td>{p.slug}</td>
                <td className="flex gap-2">
                  <Link className="btn btn-sm" to={`/admin/places/${p.id}/edit`}>Sửa</Link>
                  <button className="btn btn-sm btn-error" onClick={()=>del(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
